#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$SCRIPT_DIR/.env"
    set +a
fi

AWS_REGION="${AWS_REGION:-eu-west-3}"
EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-bookclub-eks}"
TERRAFORM_DIR="${TERRAFORM_DIR:?Set TERRAFORM_DIR in infra/.env}"

INGRESS_NAMESPACE="${INGRESS_NAMESPACE:-default}"
INGRESS_NAME="${INGRESS_NAME:-django}"

PROMETHEUS_NAMESPACE="${PROMETHEUS_NAMESPACE:-monitoring}"
PROMETHEUS_NAME="${PROMETHEUS_NAME:-kube-prometheus-stack-prometheus}"
PROMETHEUS_PVC="${PROMETHEUS_PVC:-prometheus-kube-prometheus-stack-prometheus-db-prometheus-kube-prometheus-stack-prometheus-0}"

ROOT_APP="argocd-applications"
BOOKCLUB_APP="bookclub-production"
MONITORING_APP="kube-prometheus-stack"

KUBECTL_TIMEOUT="${KUBECTL_TIMEOUT:-300s}"
ALB_TIMEOUT_SECONDS="${ALB_TIMEOUT_SECONDS:-600}"
EBS_TIMEOUT_SECONDS="${EBS_TIMEOUT_SECONDS:-300}"

if [[ ! -d "$TERRAFORM_DIR" ]]; then
    echo "Terraform directory does not exist: $TERRAFORM_DIR"
    exit 1
fi

echo "========================================"
echo "BookClub production teardown"
echo "Cluster: $EKS_CLUSTER_NAME"
echo "Region:  $AWS_REGION"
echo "========================================"
echo

echo "This will:"
echo "  - disable Argo CD automated reconciliation"
echo "  - remove the BookClub Ingress and wait for its ALB to be deleted"
echo "  - stop Prometheus through its Prometheus custom resource"
echo "  - delete Prometheus persistent storage and monitoring history"
echo "  - wait for the Prometheus EBS volume to be deleted"
echo "  - run Terraform with production_enabled=false"
echo

read -r -p "Continue? Type 'destroy' to confirm: " confirmation

if [[ "$confirmation" != "destroy" ]]; then
    echo "Aborted."
    exit 0
fi

echo
echo "Configuring kubectl for EKS..."

aws eks update-kubeconfig \
    --region "$AWS_REGION" \
    --name "$EKS_CLUSTER_NAME" \
    >/dev/null

echo "Checking Kubernetes connection..."
kubectl cluster-info >/dev/null

echo "Checking required Argo CD Applications..."

kubectl get application "$ROOT_APP" -n argocd >/dev/null
kubectl get application "$BOOKCLUB_APP" -n argocd >/dev/null
kubectl get application "$MONITORING_APP" -n argocd >/dev/null

# ---------------------------------------------------------------------------
# Discover ALB before deleting the Ingress
# ---------------------------------------------------------------------------

echo
echo "Getting ALB hostname from Ingress..."

ALB_HOSTNAME="$(
    kubectl get ingress "$INGRESS_NAME" \
        --namespace "$INGRESS_NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
)"

if [[ -z "$ALB_HOSTNAME" ]]; then
    echo "ERROR: No ALB hostname found on Ingress."
    echo "Refusing to continue because ALB cleanup cannot be verified."
    exit 1
fi

echo "Ingress ALB hostname: $ALB_HOSTNAME"

# ---------------------------------------------------------------------------
# Discover Prometheus storage before changing anything
# ---------------------------------------------------------------------------

echo
echo "Getting Prometheus persistent volume information..."

if ! kubectl get pvc "$PROMETHEUS_PVC" \
    --namespace "$PROMETHEUS_NAMESPACE" \
    >/dev/null 2>&1; then

    echo "ERROR: Prometheus PVC not found:"
    echo "  $PROMETHEUS_NAMESPACE/$PROMETHEUS_PVC"
    echo "Refusing to continue because storage cleanup cannot be verified."
    exit 1
fi

PROMETHEUS_PV="$(
    kubectl get pvc "$PROMETHEUS_PVC" \
        --namespace "$PROMETHEUS_NAMESPACE" \
        -o jsonpath='{.spec.volumeName}'
)"

if [[ -z "$PROMETHEUS_PV" ]]; then
    echo "ERROR: Prometheus PVC is not bound to a PV."
    exit 1
fi

PROMETHEUS_VOLUME_ID="$(
    kubectl get pv "$PROMETHEUS_PV" \
        -o jsonpath='{.spec.csi.volumeHandle}'
)"

if [[ -z "$PROMETHEUS_VOLUME_ID" ]]; then
    echo "ERROR: Could not determine EBS volume ID from PV:"
    echo "  $PROMETHEUS_PV"
    exit 1
fi

echo "Prometheus PVC:        $PROMETHEUS_PVC"
echo "Prometheus PV:         $PROMETHEUS_PV"
echo "Prometheus EBS volume: $PROMETHEUS_VOLUME_ID"

# ---------------------------------------------------------------------------
# Disable Argo CD reconciliation
# ---------------------------------------------------------------------------

echo
echo "Disabling automated sync on root Argo CD Application..."

kubectl patch application "$ROOT_APP" \
    --namespace argocd \
    --type merge \
    -p '{"spec":{"syncPolicy":{"automated":null}}}'

echo "Disabling automated sync on BookClub..."

kubectl patch application "$BOOKCLUB_APP" \
    --namespace argocd \
    --type merge \
    -p '{"spec":{"syncPolicy":{"automated":null}}}'

echo "Disabling automated sync on kube-prometheus-stack..."

kubectl patch application "$MONITORING_APP" \
    --namespace argocd \
    --type merge \
    -p '{"spec":{"syncPolicy":{"automated":null}}}'

# ---------------------------------------------------------------------------
# Delete Ingress and verify ALB deletion
# ---------------------------------------------------------------------------

echo
echo "Deleting BookClub Ingress..."

kubectl delete ingress "$INGRESS_NAME" \
    --namespace "$INGRESS_NAMESPACE" \
    --wait=true \
    --timeout="$KUBECTL_TIMEOUT"

echo "Waiting for the ALB to disappear from AWS..."

deadline=$((SECONDS + ALB_TIMEOUT_SECONDS))

while (( SECONDS < deadline )); do
    matching_alb="$(
        aws elbv2 describe-load-balancers \
            --region "$AWS_REGION" \
            --query "LoadBalancers[?DNSName=='${ALB_HOSTNAME}'].LoadBalancerArn | [0]" \
            --output text
    )"

    if [[ -z "$matching_alb" || "$matching_alb" == "None" ]]; then
        echo "ALB is no longer present in AWS."
        break
    fi

    echo "ALB still exists. Waiting..."
    sleep 15
done

if (( SECONDS >= deadline )); then
    echo "ERROR: Timed out waiting for ALB deletion."
    echo "Terraform will NOT be applied."
    exit 1
fi

# ---------------------------------------------------------------------------
# Stop Prometheus at the operator ownership level
# ---------------------------------------------------------------------------

echo
echo "Deleting Prometheus custom resource..."

kubectl delete prometheus "$PROMETHEUS_NAME" \
    --namespace "$PROMETHEUS_NAMESPACE" \
    --wait=true \
    --timeout="$KUBECTL_TIMEOUT"

echo "Waiting for Prometheus StatefulSet to disappear..."

deadline=$((SECONDS + KUBECTL_TIMEOUT))

while (( SECONDS < deadline )); do
    if ! kubectl get statefulset \
        "prometheus-${PROMETHEUS_NAME}" \
        --namespace "$PROMETHEUS_NAMESPACE" \
        >/dev/null 2>&1; then

        echo "Prometheus StatefulSet has been deleted."
        break
    fi

    echo "Prometheus StatefulSet still exists. Waiting..."
    sleep 5
done

if kubectl get statefulset \
    "prometheus-${PROMETHEUS_NAME}" \
    --namespace "$PROMETHEUS_NAMESPACE" \
    >/dev/null 2>&1; then

    echo "ERROR: Timed out waiting for Prometheus StatefulSet deletion."
    echo "Terraform will NOT be applied."
    exit 1
fi

# ---------------------------------------------------------------------------
# Delete Prometheus PVC now that no Prometheus pod is using it
# ---------------------------------------------------------------------------

echo
echo "Deleting Prometheus PVC..."
echo "This permanently deletes the stored Prometheus monitoring history."

kubectl delete pvc "$PROMETHEUS_PVC" \
    --namespace "$PROMETHEUS_NAMESPACE" \
    --wait=false

# ---------------------------------------------------------------------------
# Wait for PV deletion
# ---------------------------------------------------------------------------

echo "Waiting for Prometheus PV to be deleted..."

deadline=$((SECONDS + EBS_TIMEOUT_SECONDS))

while (( SECONDS < deadline )); do
    if ! kubectl get pv "$PROMETHEUS_PV" >/dev/null 2>&1; then
        echo "Prometheus PV has been deleted."
        break
    fi

    echo "Prometheus PV still exists. Waiting..."
    sleep 5
done

if kubectl get pv "$PROMETHEUS_PV" >/dev/null 2>&1; then
    echo "ERROR: Timed out waiting for Prometheus PV deletion."
    echo "Terraform will NOT be applied."
    echo "Inspect the PVC, PV, and EBS CSI controller."
    exit 1
fi

# ---------------------------------------------------------------------------
# Verify EBS deletion in AWS
# ---------------------------------------------------------------------------

echo
echo "Waiting for Prometheus EBS volume to disappear from AWS..."

deadline=$((SECONDS + EBS_TIMEOUT_SECONDS))

while (( SECONDS < deadline )); do
    volume_count="$(
        aws ec2 describe-volumes \
            --region "$AWS_REGION" \
            --volume-ids "$PROMETHEUS_VOLUME_ID" \
            --query 'length(Volumes)' \
            --output text \
            2>/dev/null || true
    )"

    if [[ -z "$volume_count" || "$volume_count" == "0" ]]; then
        echo "Prometheus EBS volume is no longer present in AWS."
        break
    fi

    echo "Prometheus EBS volume still exists. Waiting..."
    sleep 10
done

volume_count="$(
    aws ec2 describe-volumes \
        --region "$AWS_REGION" \
        --volume-ids "$PROMETHEUS_VOLUME_ID" \
        --query 'length(Volumes)' \
        --output text \
        2>/dev/null || true
)"

if [[ -n "$volume_count" && "$volume_count" != "0" ]]; then
    echo "ERROR: Timed out waiting for Prometheus EBS volume deletion."
    echo "Volume: $PROMETHEUS_VOLUME_ID"
    echo "Terraform will NOT be applied."
    exit 1
fi

# ---------------------------------------------------------------------------
# Destroy production infrastructure
# ---------------------------------------------------------------------------

echo
echo "Kubernetes-managed AWS resources have been cleaned up."
echo "Applying Terraform with production_enabled=false..."

terraform -chdir="$TERRAFORM_DIR" apply \
    -var="production_enabled=false" \
    -auto-approve

echo
echo "========================================"
echo "BookClub production teardown complete."
echo "========================================"