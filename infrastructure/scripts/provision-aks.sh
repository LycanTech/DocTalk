#!/usr/bin/env bash
# DocTalk — AKS Provisioning Script
# Run once to create all Azure infrastructure. Safe to re-run (idempotent where possible).
#
# Prerequisites:
#   az login && az account set --subscription <your-subscription-id>
#   helm (https://helm.sh/docs/intro/install/)
#   kubectl
#
# Usage:
#   chmod +x provision-aks.sh
#   ./provision-aks.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
RESOURCE_GROUP="doctalk-rg"
LOCATION="southafricanorth"
ACR_NAME="doctalkregistry"          # Must be globally unique — change if taken
AKS_NAME="doctalk-aks"
POSTGRES_SERVER="doctalk-postgres"
POSTGRES_DB="doctalk_prod"
POSTGRES_USER="doctalk"
K8S_VERSION="1.30"
NODE_VM="Standard_B2s"
NODE_COUNT=2

echo "==> DocTalk AKS Provisioning"
echo "    Resource group : $RESOURCE_GROUP"
echo "    Location       : $LOCATION"
echo "    ACR            : $ACR_NAME"
echo "    AKS cluster    : $AKS_NAME"
echo ""

# ── 1. Resource Group ──────────────────────────────────────────────────────────
echo "[1/8] Creating resource group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# ── 2. Azure Container Registry ────────────────────────────────────────────────
echo "[2/8] Creating ACR ($ACR_NAME)..."
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled false \
  --output none

ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)
echo "     ACR login server: $ACR_LOGIN_SERVER"

# ── 3. AKS Cluster ─────────────────────────────────────────────────────────────
echo "[3/8] Creating AKS cluster (this takes ~5 min)..."
az aks create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_NAME" \
  --node-count "$NODE_COUNT" \
  --node-vm-size "$NODE_VM" \
  --kubernetes-version "$K8S_VERSION" \
  --enable-managed-identity \
  --attach-acr "$ACR_NAME" \
  --network-plugin azure \
  --generate-ssh-keys \
  --output none

# ── 4. Get kubeconfig ──────────────────────────────────────────────────────────
echo "[4/8] Fetching kubeconfig..."
az aks get-credentials \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_NAME" \
  --overwrite-existing

kubectl get nodes

# ── 5. Azure Database for PostgreSQL Flexible Server ──────────────────────────
echo "[5/8] Creating PostgreSQL Flexible Server (this takes ~3 min)..."
echo "      Enter a strong password for the postgres admin user:"
read -rs POSTGRES_PASSWORD
echo ""

az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER" \
  --location "$LOCATION" \
  --database-name "$POSTGRES_DB" \
  --admin-user "$POSTGRES_USER" \
  --admin-password "$POSTGRES_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32 \
  --public-access None \
  --output none

POSTGRES_FQDN=$(az postgres flexible-server show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_SERVER" \
  --query fullyQualifiedDomainName -o tsv)
echo "     PostgreSQL FQDN: $POSTGRES_FQDN"

# Allow AKS outbound IPs to reach PostgreSQL
AKS_OUTBOUND_IP=$(az aks show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$AKS_NAME" \
  --query networkProfile.loadBalancerProfile.effectiveOutboundIPs[0].id -o tsv \
  | xargs az network public-ip show --ids --query ipAddress -o tsv 2>/dev/null || echo "")

if [[ -n "$AKS_OUTBOUND_IP" ]]; then
  az postgres flexible-server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$POSTGRES_SERVER" \
    --rule-name aks-outbound \
    --start-ip-address "$AKS_OUTBOUND_IP" \
    --end-ip-address "$AKS_OUTBOUND_IP" \
    --output none
  echo "     Firewall rule added for AKS outbound IP: $AKS_OUTBOUND_IP"
fi

DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_FQDN}:5432/${POSTGRES_DB}?sslmode=require"

# ── 6. nginx Ingress Controller ────────────────────────────────────────────────
echo "[6/8] Installing nginx Ingress Controller..."
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx --force-update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.replicaCount=2 \
  --set controller.nodeSelector."kubernetes\.io/os"=linux \
  --set defaultBackend.nodeSelector."kubernetes\.io/os"=linux \
  --wait

INGRESS_IP=$(kubectl get svc ingress-nginx-controller -n ingress-nginx \
  --output jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "     Ingress external IP: $INGRESS_IP"
echo "     *** Point your DNS A records to this IP:"
echo "         doctalk.ng          → $INGRESS_IP"
echo "         api.doctalk.ng      → $INGRESS_IP"
echo "         staging.doctalk.ng  → $INGRESS_IP"
echo "         api.staging.doctalk.ng → $INGRESS_IP"

# ── 7. cert-manager ────────────────────────────────────────────────────────────
echo "[7/8] Installing cert-manager..."
helm repo add jetstack https://charts.jetstack.io --force-update
helm upgrade --install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.15.0 \
  --set installCRDs=true \
  --wait

# ── 8. Create GitHub Actions Service Principal ─────────────────────────────────
echo "[8/8] Creating service principal for GitHub Actions..."
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
SP_JSON=$(az ad sp create-for-rbac \
  --name "doctalk-github-actions" \
  --role Contributor \
  --scopes "/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}" \
  --sdk-auth)
ACR_ID=$(az acr show --name "$ACR_NAME" --query id -o tsv)
SP_APP_ID=$(echo "$SP_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['clientId'])")
az role assignment create \
  --assignee "$SP_APP_ID" \
  --role AcrPush \
  --scope "$ACR_ID" \
  --output none

echo ""
echo "══════════════════════════════════════════════════════════════════"
echo " PROVISIONING COMPLETE — add these secrets to GitHub Actions:"
echo "══════════════════════════════════════════════════════════════════"
echo ""
echo "AZURE_CREDENTIALS (entire JSON block below):"
echo "$SP_JSON"
echo ""
echo "ACR_LOGIN_SERVER=$ACR_LOGIN_SERVER"
echo "AKS_RESOURCE_GROUP=$RESOURCE_GROUP"
echo "AKS_CLUSTER_NAME=$AKS_NAME"
echo ""
echo "DATABASE_URL=$DATABASE_URL"
echo ""
echo "Next step: run  ./create-secrets.sh  to push K8s secrets to the cluster."
echo "══════════════════════════════════════════════════════════════════"
