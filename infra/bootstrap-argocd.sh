#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/.env" ]]; then
    set -a
    source "$SCRIPT_DIR/.env"
    set +a
fi

: "${ARGO_GITHUB_APP_ID:?ARGO_GITHUB_APP_ID is required}"
: "${ARGO_GITHUB_APP_INSTALLATION_ID:?ARGO_GITHUB_APP_INSTALLATION_ID is required}"

PRIVATE_KEY="$SCRIPT_DIR/bookclub-argo-reader.private-key.pem"

if [[ ! -f "$PRIVATE_KEY" ]]; then
    echo "GitHub App private key not found: $PRIVATE_KEY"
    exit 1
fi

echo "Configuring kubectl for EKS..."

aws eks update-kubeconfig \
    --region eu-west-3 \
    --name bookclub-eks \
    >/dev/null

echo "Checking Kubernetes connection..."
kubectl cluster-info >/dev/null

echo "Waiting for Argo CD..."

kubectl wait \
    --namespace argocd \
    --for=condition=Available \
    deployment/argocd-server \
    --timeout=300s

kubectl wait \
    --namespace argocd \
    --for=condition=Available \
    deployment/argocd-repo-server \
    --timeout=300s

echo "Creating Argo CD repository credential..."

kubectl create secret generic bookclub-deployment-repo \
    --namespace argocd \
    --from-literal=type=git \
    --from-literal=url=https://github.com/SinanErbezci/bookclub-deployment.git \
    --from-literal=githubAppID="$ARGO_GITHUB_APP_ID" \
    --from-literal=githubAppInstallationID="$ARGO_GITHUB_APP_INSTALLATION_ID" \
    --from-file=githubAppPrivateKey="$PRIVATE_KEY" \
    --dry-run=client \
    -o yaml |
kubectl apply -f -

kubectl label secret bookclub-deployment-repo \
    --namespace argocd \
    argocd.argoproj.io/secret-type=repository \
    --overwrite

echo "Argo CD repository credential created."

echo "Creating Argo CD Application..."

kubectl apply -f - <<EOF
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: bookclub-production
  namespace: argocd
spec:
  project: default

  source:
    repoURL: https://github.com/SinanErbezci/bookclub-deployment.git
    targetRevision: main
    path: k8s/applications/bookclub/overlays/production

  destination:
    server: https://kubernetes.default.svc
    namespace: default

  syncPolicy:
    automated:
      prune: true
      selfHeal: true
EOF

echo "Argo CD bootstrap complete."