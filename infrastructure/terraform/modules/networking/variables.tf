variable "vnet_name" {
  type        = string
  description = "Name of the virtual network"
}

variable "resource_group_name" {
  type        = string
  description = "Name of the resource group"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
}

variable "address_space" {
  type        = list(string)
  description = "VNet address space"
  default     = ["10.0.0.0/16"]
}

variable "aks_subnet_prefixes" {
  type        = list(string)
  description = "AKS subnet address prefixes"
  default     = ["10.0.1.0/24"]
}

variable "db_subnet_prefixes" {
  type        = list(string)
  description = "Database subnet address prefixes (for Flexible Server)"
  default     = ["10.0.2.0/24"]
}

variable "create_postgres_dns_zone" {
  type        = bool
  description = "Whether to create a private DNS zone for PostgreSQL Flexible Server"
  default     = false
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
