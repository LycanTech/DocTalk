variable "cluster_name" {
  type        = string
  description = "AKS cluster name"
}

variable "resource_group_name" {
  type        = string
  description = "Resource group for the AKS cluster"
}

variable "location" {
  type        = string
  description = "Azure region"
}

variable "kubernetes_version" {
  type        = string
  description = "Kubernetes version"
  default     = "1.29"
}

variable "aks_subnet_id" {
  type        = string
  description = "Subnet ID for the AKS node pool"
}

variable "acr_id" {
  type        = string
  description = "ACR resource ID — AKS kubelet identity is granted AcrPull"
}

variable "system_node_count" {
  type        = number
  description = "Node count for the system node pool"
  default     = 2
}

variable "system_vm_size" {
  type        = string
  description = "VM size for system nodes"
  default     = "Standard_B2s"
}

variable "create_app_node_pool" {
  type        = bool
  description = "Whether to create a separate user node pool for app workloads"
  default     = false
}

variable "app_vm_size" {
  type        = string
  description = "VM size for the app node pool"
  default     = "Standard_D2s_v3"
}

variable "app_node_count" {
  type        = number
  description = "Node count for the app node pool"
  default     = 2
}

variable "log_analytics_workspace_id" {
  type        = string
  description = "Log Analytics workspace ID for OMS agent. Null disables the agent."
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "Resource tags"
  default     = {}
}
