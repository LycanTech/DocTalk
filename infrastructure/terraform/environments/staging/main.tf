provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

locals {
  env  = "staging"
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
  address_space       = ["10.20.0.0/16"]
  aks_subnet_prefixes = ["10.20.1.0/24"]
  db_subnet_prefixes  = ["10.20.2.0/24"]

  # Staging uses Azure Flexible Server — needs private DNS zone
  create_postgres_dns_zone = true

  tags = local.tags
}

# ── Container Registry (reference the shared dev ACR) ──────────────────────────

data "azurerm_container_registry" "shared" {
  name                = "doctalkacr"
  resource_group_name = "doctalk-rg"
}

# ── Monitoring ─────────────────────────────────────────────────────────────────

module "monitoring" {
  source = "../../modules/monitoring"

  workspace_name            = "${local.name}-${local.env}-logs"
  resource_group_name       = azurerm_resource_group.this.name
  location                  = var.location
  retention_days            = 60
  enable_managed_prometheus = false
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
  acr_id              = data.azurerm_container_registry.shared.id

  system_node_count = 2
  system_vm_size    = "Standard_B2s"

  create_app_node_pool = false

  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.tags
}

# ── PostgreSQL Flexible Server ─────────────────────────────────────────────────

module "postgres" {
  source = "../../modules/postgres"

  server_name         = "${local.name}-${local.env}-pg"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location

  sku_name              = "B_Standard_B1ms"
  storage_mb            = 32768
  backup_retention_days = 7
  geo_redundant_backup  = false
  high_availability_mode = "Disabled"

  db_subnet_id        = module.networking.db_subnet_id
  private_dns_zone_id = module.networking.postgres_dns_zone_id

  tags = local.tags
}
