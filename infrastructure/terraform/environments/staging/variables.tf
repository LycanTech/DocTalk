variable "subscription_id" {
  type        = string
  description = "Azure subscription ID"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "eastus"
}

variable "alert_email_addresses" {
  type        = list(string)
  description = "Email addresses for monitoring alerts"
  default     = ["lycandevops@gmail.com"]
}
