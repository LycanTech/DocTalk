resource "azurerm_log_analytics_workspace" "this" {
  name                = var.workspace_name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "PerGB2018"
  retention_in_days   = var.retention_days
  tags                = var.tags
}

# Azure Monitor managed Prometheus + Grafana (AKS add-on)
resource "azurerm_monitor_workspace" "this" {
  count               = var.enable_managed_prometheus ? 1 : 0
  name                = "${var.workspace_name}-prom"
  resource_group_name = var.resource_group_name
  location            = var.location
  tags                = var.tags
}

resource "azurerm_dashboard_grafana" "this" {
  count               = var.enable_managed_prometheus ? 1 : 0
  name                = "${var.workspace_name}-grafana"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Standard"

  identity {
    type = "SystemAssigned"
  }

  azure_monitor_workspace_integrations {
    resource_id = azurerm_monitor_workspace.this[0].id
  }

  tags = var.tags
}

# Grafana needs Reader on the Monitor workspace to pull metrics
resource "azurerm_role_assignment" "grafana_monitor_reader" {
  count                = var.enable_managed_prometheus ? 1 : 0
  scope                = azurerm_monitor_workspace.this[0].id
  role_definition_name = "Monitoring Data Reader"
  principal_id         = azurerm_dashboard_grafana.this[0].identity[0].principal_id
}

# Alert rule — API pod restarts
resource "azurerm_monitor_metric_alert" "pod_restarts" {
  name                = "${var.workspace_name}-pod-restarts"
  resource_group_name = var.resource_group_name
  scopes              = var.aks_cluster_ids
  description         = "Alert when any pod exceeds restart threshold"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.ContainerService/managedClusters"
    metric_name      = "kube_pod_container_status_restarts_total"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.ops.id
  }

  tags = var.tags
}

resource "azurerm_monitor_action_group" "ops" {
  name                = "${var.workspace_name}-ops"
  resource_group_name = var.resource_group_name
  short_name          = "doctalks"

  dynamic "email_receiver" {
    for_each = var.alert_email_addresses
    content {
      name          = "ops-${email_receiver.key}"
      email_address = email_receiver.value
    }
  }

  tags = var.tags
}
