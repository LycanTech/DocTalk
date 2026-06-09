#!/usr/bin/env bash
# DocTalk — Push K8s Secrets to cluster
# Run after provision-aks.sh, before first deploy.
# All env vars below must be exported before running, e.g.:
#   export DATABASE_URL="postgresql://..."
#   export JWT_SECRET="$(openssl rand -hex 32)"
#   export JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
#   export ANTHROPIC_API_KEY="sk-ant-..."
#   export VAPID_PUBLIC_KEY="..."
#   export VAPID_PRIVATE_KEY="..."
#   export COUCHDB_PASSWORD="$(openssl rand -hex 16)"
#   ./create-secrets.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

NAMESPACE="${NAMESPACE:-doctalk}"

: "${DATABASE_URL:?DATABASE_URL must be set}"
: "${JWT_SECRET:?JWT_SECRET must be set}"
: "${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET must be set}"
: "${ANTHROPIC_API_KEY:?ANTHROPIC_API_KEY must be set}"
: "${VAPID_PUBLIC_KEY:?VAPID_PUBLIC_KEY must be set}"
: "${VAPID_PRIVATE_KEY:?VAPID_PRIVATE_KEY must be set}"
: "${COUCHDB_PASSWORD:?COUCHDB_PASSWORD must be set}"

echo "==> Creating namespace $NAMESPACE (if not exists)..."
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

echo "==> Creating/updating doctalk-secrets..."
kubectl create secret generic doctalk-secrets \
  --namespace="$NAMESPACE" \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  --from-literal=VAPID_PUBLIC_KEY="$VAPID_PUBLIC_KEY" \
  --from-literal=VAPID_PRIVATE_KEY="$VAPID_PRIVATE_KEY" \
  --from-literal=COUCHDB_USER="admin" \
  --from-literal=COUCHDB_PASSWORD="$COUCHDB_PASSWORD" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> Secrets applied. Verify with:"
echo "    kubectl get secret doctalk-secrets -n $NAMESPACE"
