#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi

AWS_REGION="${AWS_REGION:-eu-west-3}"
EKS_CLUSTER_NAME="${EKS_CLUSTER_NAME:-bookclub-eks}"
TERRAFORM_DIR="${TERRAFORM_DIR:?Set TERRAFORM_DIR in infra/.env}"
INGRESS_NAMESPACE="${INGRESS_NAMESPACE:-default}"
INGRESS_NAME="${INGRESS_NAME:-django}"

ROOT_APP="argocd-applications"
BOOKCLUB_APP="bookclub-production"

KUBECTL_TIMEOUT="${KUBECTL_TIMEOUT:-300s}"
ALB_TIMEOUT_SECONDS="${ALB_TIMEOUT_SECONDS:-600}"

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
echo "This will remove the BookClub Ingress, wait for its ALB to be deleted,"
echo "then run Terraform with production_enabled=false."
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

echo "Getting ALB hostname from Ingress..."

ALB_HOSTNAME="$(
    kubectl get ingress "$INGRESS_NAME" \
        --namespace "$INGRESS_NAMESPACE" \
        -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
)"

if [[ -z "$ALB_HOSTNAME" ]]; then
    echo "No ALB hostname found on Ingress."
    echo "Refusing to continue because we cannot verify ALB cleanup."
    exit 1
fi

echo "Ingress ALB hostname: $ALB_HOSTNAME"

echo
echo "Disabling automated sync on the root Argo CD Application..."

kubectl patch application "$ROOT_APP" \
    --namespace argocd \
    --type merge \
    -p '{"spec":{"syncPolicy":{"automated":null}}}'

echo "Disabling automated sync on BookClub..."

kubectl patch application "$BOOKCLUB_APP" \
    --namespace argocd \
    --type merge \
    -p '{"spec":{"syncPolicy":{"automated":null}}}'

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
    echo "Inspect the Ingress, AWS Load Balancer Controller logs, and ALB."
    exit 1
fi

echo
echo "Applying Terraform with production_enabled=false..."

terraform -chdir="$TERRAFORM_DIR" apply \
    -var="production_enabled=false" \
    -auto-approve

echo
echo "BookClub production teardown complete."