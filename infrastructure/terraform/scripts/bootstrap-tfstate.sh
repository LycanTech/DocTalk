#!/usr/bin/env bash
# Create the Azure storage backend for Terraform remote state.
# Run once before `terraform init` in any environment.
#
# Usage: SUBSCRIPTION_ID=<id> bash infrastructure/terraform/scripts/bootstrap-tfstate.sh

set -euo pipefail

RESOURCE_GROUP="doctalk-tfstate-rg"
STORAGE_ACCOUNT="doctalktfstate"
CONTAINER="tfstate"
LOCATION="${LOCATION:-eastus}"
SUBSCRIPTION_ID="${SUBSCRIPTION_ID:?Please set SUBSCRIPTION_ID}"

echo "==> Setting subscription"
az account set --subscription "$SUBSCRIPTION_ID"

echo "==> Creating resource group: $RESOURCE_GROUP"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none

echo "==> Creating storage account: $STORAGE_ACCOUNT"
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2 \
  --allow-blob-public-access false \
  --min-tls-version TLS1_2 \
  --output none

echo "==> Enabling versioning (soft-delete protection for state files)"
az storage account blob-service-properties update \
  --account-name "$STORAGE_ACCOUNT" \
  --enable-versioning true \
  --output none

echo "==> Creating blob container: $CONTAINER"
az storage container create \
  --name "$CONTAINER" \
  --account-name "$STORAGE_ACCOUNT" \
  --output none

echo ""
echo "==> Done. Remote state backend is ready."
echo "    Run terraform init inside each environment directory:"
echo "    cd infrastructure/terraform/environments/dev && terraform init"
