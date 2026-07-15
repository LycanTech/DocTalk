output "vnet_id" {
  value = azurerm_virtual_network.this.id
}

output "aks_subnet_id" {
  value = azurerm_subnet.aks.id
}

output "db_subnet_id" {
  value = azurerm_subnet.db.id
}

output "postgres_dns_zone_id" {
  value = var.create_postgres_dns_zone ? azurerm_private_dns_zone.postgres[0].id : null
}

output "postgres_dns_zone_name" {
  value = var.create_postgres_dns_zone ? azurerm_private_dns_zone.postgres[0].name : null
}
