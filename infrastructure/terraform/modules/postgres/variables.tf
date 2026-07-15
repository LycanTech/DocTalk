variable "server_name" {
  type        = string
  description = "PostgreSQL Flexible Server name (must be globally unique)"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "admin_username" {
  type        = string
  description = "PostgreSQL administrator login name"
  default     = "doctaladmin"
}

variable "sku_name" {
  type        = string
  description = "Flexible Server SKU"
  default     = "B_Standard_B1ms"
  # Burstable: B_Standard_B1ms (staging)
  # General Purpose: GP_Standard_D2s_v3 (prod)
}

variable "storage_mb" {
  type        = number
  description = "Storage size in megabytes"
  default     = 32768 # 32 GB
}

variable "backup_retention_days" {
  type        = number
  description = "Backup retention period in days (7–35)"
  default     = 7
}

variable "geo_redundant_backup" {
  type        = bool
  description = "Enable geo-redundant backups (not available in all regions)"
  default     = false
}

variable "high_availability_mode" {
  type        = string
  description = "High availability mode: Disabled, SameZone, or ZoneRedundant"
  default     = "Disabled"

  validation {
    condition     = contains(["Disabled", "SameZone", "ZoneRedundant"], var.high_availability_mode)
    error_message = "Must be Disabled, SameZone, or ZoneRedundant."
  }
}

variable "standby_zone" {
  type        = string
  description = "Availability zone for the standby server (ZoneRedundant HA only)"
  default     = "2"
}

variable "db_subnet_id" {
  type        = string
  description = "Delegated subnet ID for Flexible Server private access"
}

variable "private_dns_zone_id" {
  type        = string
  description = "Private DNS zone ID for the Flexible Server"
}

variable "aks_outbound_ip" {
  type        = string
  description = "AKS outbound public IP to add to firewall rules (null = VNet-only access)"
  default     = null
}

variable "key_vault_id" {
  type        = string
  description = "Key Vault resource ID to store generated credentials. Null = skip."
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
