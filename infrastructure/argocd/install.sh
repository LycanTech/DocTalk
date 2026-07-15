#!/usr/bin/env bash
# Bootstrap Argo CD on the current kubectl context.
# Run once after `az aks get-credentials` has been executed.
#
# Usage: bash infrastructure/argocd/install.sh

set -euo pipefail

ARGOCD_VERSION="v2.11.3"
ARGOCD_NAMESPACE="argocd"

echo "==> Creating argocd namespace"
kubectl create namespace "$ARGOCD_NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "==> Installing Argo CD ${ARGOCD_VERSION}"
kubectl apply -n "$ARGOCD_NAMESPACE" \
  -f "https://raw.githubusercontent.com/argoproj/argo-cd/${ARGOCD_VERSION}/manifests/install.yaml"

echo "==> Waiting for Argo CD pods to be ready"
kubectl rollout status deployment/argocd-server -n "$ARGOCD_NAMESPACE" --timeout=5m

echo "==> Applying DocTalk AppProject"
kubectl apply -f infrastructure/argocd/projects/doctalk.yaml

echo "==> Applying ApplicationSet (generates dev / staging / prod apps)"
kubectl apply -f infrastructure/argocd/applicationset.yaml

echo ""
echo "==> Argo CD is ready."
echo "    Get the initial admin password:"
echo "    kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}' | base64 -d"
echo ""
echo "    Port-forward the UI:"
echo "    kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo "    Then open https://localhost:8080  (user: admin)"
