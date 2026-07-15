output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.this.id
}

output "log_analytics_workspace_key" {
  value     = azurerm_log_analytics_workspace.this.primary_shared_key
  sensitive = true
}

output "grafana_endpoint" {
  value = var.enable_managed_prometheus ? azurerm_dashboard_grafana.this[0].endpoint : null
}
