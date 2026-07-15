variable "acr_name" {
  type        = string
  description = "Azure Container Registry name (must be globally unique, alphanumeric only)"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "sku" {
  type        = string
  description = "ACR SKU: Basic, Standard, or Premium"
  default     = "Standard"

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.sku)
    error_message = "ACR SKU must be Basic, Standard, or Premium."
  }
}

variable "geo_replication_locations" {
  type        = list(string)
  description = "List of regions for geo-replication (Premium SKU only)"
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
