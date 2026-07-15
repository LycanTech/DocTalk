variable "workspace_name" {
  type        = string
  description = "Log Analytics workspace name"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group name"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "retention_days" {
  type        = number
  description = "Log retention in days"
  default     = 30
}

variable "enable_managed_prometheus" {
  type        = bool
  description = "Enable Azure Monitor managed Prometheus and Grafana"
  default     = false
}

variable "aks_cluster_ids" {
  type        = list(string)
  description = "AKS cluster resource IDs to scope alerts to"
  default     = []
}

variable "alert_email_addresses" {
  type        = list(string)
  description = "Email addresses for operations alerts"
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
