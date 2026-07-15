provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

locals {
  env  = "dev"
  name = "doctalk"
  tags = {
    environment = local.env
    project     = local.name
    managed_by  = "terraform"
  }
}

# ── Resource Group ─────────────────────────────────────────────────────────────

resource "azurerm_resource_group" "this" {
  name     = "${local.name}-rg"
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
  address_space       = ["10.10.0.0/16"]
  aks_subnet_prefixes = ["10.10.1.0/24"]
  db_subnet_prefixes  = ["10.10.2.0/24"]

  # Dev uses in-cluster Postgres — no Flexible Server DNS zone needed
  create_postgres_dns_zone = false

  tags = local.tags
}

# ── Container Registry (shared across all envs) ────────────────────────────────

module "acr" {
  source = "../../modules/acr"

  acr_name            = "doctalkacr"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  sku                 = "Basic"

  tags = local.tags
}

# ── Monitoring ─────────────────────────────────────────────────────────────────

module "monitoring" {
  source = "../../modules/monitoring"

  workspace_name            = "${local.name}-${local.env}-logs"
  resource_group_name       = azurerm_resource_group.this.name
  location                  = var.location
  retention_days            = 30
  enable_managed_prometheus = false
  aks_cluster_ids           = [module.aks.cluster_id]
  alert_email_addresses     = var.alert_email_addresses

  tags = local.tags
}

# ── AKS Cluster ────────────────────────────────────────────────────────────────

module "aks" {
  source = "../../modules/aks"

  cluster_name        = "${local.name}-aks"
  resource_group_name = azurerm_resource_group.this.name
  location            = var.location
  kubernetes_version  = "1.29"
  aks_subnet_id       = module.networking.aks_subnet_id
  acr_id              = module.acr.acr_id

  system_node_count = 2
  system_vm_size    = "Standard_B2s"

  # Dev: no separate app node pool — keep costs down
  create_app_node_pool = false

  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id

  tags = local.tags
}
