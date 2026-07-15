provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

locals {
  env  = "prod"
  name = "doctalk"
  tags = {
    environment = local.env
    project     = local.name
    managed_by  = "terraform"
  }
}

# ── Resource Group ─────────────────────────────────────────────────────────────

resource "azurerm_resource_group" "this" {
  name     = "${local.name}-${local.env}-rg"
  location = var.location
  tags     = local.tags
}

# ── Networking ─────────────────────────────────────────────────────────────────

module "networking" {
  source = "../../modules/networking"

  vnet_name           = "${local.name}-${local.env}-vnet"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  environment         = local.env
  address_space       = ["10.30.0.0/16"]
  aks_subnet_prefixes = ["10.30.1.0/24"]
  db_subnet_prefixes  = ["10.30.2.0/24"]

  create_postgres_dns_zone = true

  tags = local.tags
}

# ── Container Registry ─────────────────────────────────────────────────────────
# Prod has its own Premium ACR with geo-replication

module "acr" {
  source = "../../modules/acr"

  acr_name            = "doctalkprodacr"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  sku                 = "Premium"

  geo_replication_locations = var.acr_geo_replication_locations

  tags = local.tags
}

# ── Monitoring ─────────────────────────────────────────────────────────────────

module "monitoring" {
  source = "../../modules/monitoring"

  workspace_name            = "${local.name}-${local.env}-logs"
  resource_group_name       = azurerm_resource_group.this.name
  location                  = var.location
  retention_days            = 90
  enable_managed_prometheus = true
  aks_cluster_ids           = [module.aks.cluster_id]
  alert_email_addresses     = var.alert_email_addresses

  tags = local.tags
}

# ── AKS Cluster ────────────────────────────────────────────────────────────────

module "aks" {
  source = "../../modules/aks"

  cluster_name        = "${local.name}-${local.env}-aks"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  kubernetes_version  = "1.29"
  aks_subnet_id       = module.networking.aks_subnet_id
  acr_id              = module.acr.acr_id

  # Prod: system nodes are tainted for Kubernetes components only
  system_node_count = 2
  system_vm_size    = "Standard_D2s_v3"

  # Prod: separate user node pool for application workloads
  create_app_node_pool = true
  app_vm_size          = "Standard_D4s_v3"
  app_node_count       = 3

  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.tags
}

# ── PostgreSQL Flexible Server (Zone Redundant HA) ─────────────────────────────

module "postgres" {
  source = "../../modules/postgres"

  server_name         = "${local.name}-${local.env}-pg"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location

  sku_name               = "GP_Standard_D2s_v3"
  storage_mb             = 131072 # 128 GB
  backup_retention_days  = 35
  geo_redundant_backup   = true
  high_availability_mode = "ZoneRedundant"
  standby_zone           = "2"

  db_subnet_id        = module.networking.db_subnet_id
  private_dns_zone_id = module.networking.postgres_dns_zone_id

  key_vault_id = azurerm_key_vault.this.id

  tags = local.tags
}

# ── Key Vault ──────────────────────────────────────────────────────────────────

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "this" {
  name                        = "${local.name}${local.env}kv"
  resource_group_name         = azurerm_resource_group.this.name
  location                    = var.location
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  soft_delete_retention_days  = 90
  purge_protection_enabled    = true

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = ["Get", "List", "Set", "Delete", "Recover", "Backup", "Restore", "Purge"]
  }

  tags = local.tags
}
