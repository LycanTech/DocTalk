terraform {
  backend "azurerm" {
    resource_group_name  = "doctalk-tfstate-rg"
    storage_account_name = "doctalktfstate"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}
