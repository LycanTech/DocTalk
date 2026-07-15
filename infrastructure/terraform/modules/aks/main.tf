resource "azurerm_kubernetes_cluster" "this" {
  name                = var.cluster_name
  resource_group_name = var.resource_group_name
  location            = var.location
  dns_prefix          = var.cluster_name
  kubernetes_version  = var.kubernetes_version

  oidc_issuer_enabled       = true
  workload_identity_enabled = true

  default_node_pool {
    name            = "system"
    node_count      = var.system_node_count
    vm_size         = var.system_vm_size
    vnet_subnet_id  = var.aks_subnet_id
    os_disk_size_gb = 50

    upgrade_settings {
      max_surge = "33%"
    }
  }

  identity {
    type = "SystemAssigned"
  }

  web_app_routing {
    dns_zone_ids = []
  }

  network_profile {
    network_plugin    = "azure"
    network_policy    = "azure"
    load_balancer_sku = "standard"
    outbound_type     = "loadBalancer"
  }

  dynamic "oms_agent" {
    for_each = var.log_analytics_workspace_id != null ? [1] : []
    content {
      log_analytics_workspace_id = var.log_analytics_workspace_id
    }
  }

  auto_scaler_profile {
    balance_similar_node_groups  = false
    expander                     = "random"
    max_graceful_termination_sec = 600
    scale_down_delay_after_add   = "10m"
    scale_down_unneeded          = "10m"
  }

  tags = var.tags
}

# Allow AKS kubelet identity to pull images from ACR
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = var.acr_id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.this.kubelet_identity[0].object_id
}

# User node pool for application workloads (separate from system pool)
resource "azurerm_kubernetes_cluster_node_pool" "app" {
  count                 = var.create_app_node_pool ? 1 : 0
  name                  = "app"
  kubernetes_cluster_id = azurerm_kubernetes_cluster.this.id
  vm_size               = var.app_vm_size
  node_count            = var.app_node_count
  vnet_subnet_id        = var.aks_subnet_id
  os_disk_size_gb       = 100
  mode                  = "User"

  node_labels = {
    "doctalk/node-pool" = "app"
  }

  tags = var.tags
}
