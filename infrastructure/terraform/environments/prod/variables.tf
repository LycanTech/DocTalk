variable "subscription_id" {
  type        = string
  description = "Azure subscription ID"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "eastus"
}

variable "acr_geo_replication_locations" {
  type        = list(string)
  description = "Additional Azure regions for ACR geo-replication (Premium SKU)"
  default     = ["westeurope"]
}

variable "alert_email_addresses" {
  type        = list(string)
  description = "Email addresses for monitoring alerts"
  default     = ["lycandevops@gmail.com"]
}
