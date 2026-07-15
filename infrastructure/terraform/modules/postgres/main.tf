# Azure Database for PostgreSQL Flexible Server
# Used in staging and prod. Dev uses an in-cluster StatefulSet.

resource "random_password" "postgres" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "azurerm_postgresql_flexible_server" "this" {
  name                = var.server_name
  resource_group_name = var.resource_group_name
  location            = var.location

  administrator_login    = var.admin_username
  administrator_password = random_password.postgres.result

  sku_name   = var.sku_name
  version    = "16"
  storage_mb = var.storage_mb

  delegated_subnet_id = var.db_subnet_id
  private_dns_zone_id = var.private_dns_zone_id

  backup_retention_days        = var.backup_retention_days
  geo_redundant_backup_enabled = var.geo_redundant_backup

  high_availability {
    mode                      = var.high_availability_mode
    standby_availability_zone = var.high_availability_mode == "ZoneRedundant" ? var.standby_zone : null
  }

  maintenance_window {
    day_of_week  = 0
    start_hour   = 2
    start_minute = 0
  }

  tags = var.tags

  lifecycle {
    ignore_changes = [zone, high_availability[0].standby_availability_zone]
  }
}

resource "azurerm_postgresql_flexible_server_database" "doctalk" {
  name      = "doctalk"
  server_id = azurerm_postgresql_flexible_server.this.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Allow connections from AKS subnet
resource "azurerm_postgresql_flexible_server_firewall_rule" "aks" {
  count            = var.aks_outbound_ip != null ? 1 : 0
  name             = "allow-aks"
  server_id        = azurerm_postgresql_flexible_server.this.id
  start_ip_address = var.aks_outbound_ip
  end_ip_address   = var.aks_outbound_ip
}

# Store the generated password in Key Vault
resource "azurerm_key_vault_secret" "postgres_password" {
  count        = var.key_vault_id != null ? 1 : 0
  name         = "postgres-password"
  value        = random_password.postgres.result
  key_vault_id = var.key_vault_id

  tags = var.tags
}

resource "azurerm_key_vault_secret" "postgres_url" {
  count = var.key_vault_id != null ? 1 : 0
  name  = "database-url"
  value = "postgresql://${var.admin_username}:${urlencode(random_password.postgres.result)}@${azurerm_postgresql_flexible_server.this.fqdn}/doctalk?sslmode=require"
  key_vault_id = var.key_vault_id

  tags = var.tags
}
