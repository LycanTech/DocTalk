output "server_id" {
  value = azurerm_postgresql_flexible_server.this.id
}

output "fqdn" {
  value = azurerm_postgresql_flexible_server.this.fqdn
}

output "admin_username" {
  value = azurerm_postgresql_flexible_server.this.administrator_login
}

output "admin_password" {
  value     = random_password.postgres.result
  sensitive = true
}

output "database_url" {
  value     = "postgresql://${azurerm_postgresql_flexible_server.this.administrator_login}:${urlencode(random_password.postgres.result)}@${azurerm_postgresql_flexible_server.this.fqdn}/doctalk?sslmode=require"
  sensitive = true
}
