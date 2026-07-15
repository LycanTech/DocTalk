resource "azurerm_container_registry" "this" {
  name                = var.acr_name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = var.sku
  admin_enabled       = false

  dynamic "georeplications" {
    for_each = var.geo_replication_locations
    content {
      location                = georeplications.value
      zone_redundancy_enabled = false
    }
  }

  tags = var.tags
}

# Lifecycle policy — keep last 10 untagged manifests per repo
resource "azurerm_container_registry_task" "purge" {
  name                  = "purge-untagged"
  container_registry_id = azurerm_container_registry.this.id

  platform {
    os = "Linux"
  }

  encoded_step {
    task_content = base64encode(<<-YAML
      version: v1.1.0
      steps:
        - cmd: >
            acr purge
            --filter '.*:.*'
            --untagged
            --keep 10
            --ago 30d
          disableWorkingDirectoryOverride: true
          timeout: 3600
    YAML
    )
  }

  timer_trigger {
    name     = "weekly"
    schedule = "0 2 * * 0"
    enabled  = true
  }

  tags = var.tags
}
