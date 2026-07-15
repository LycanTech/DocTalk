output "aks_cluster_name" {
  value = module.aks.cluster_name
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "oidc_issuer_url" {
  value = module.aks.oidc_issuer_url
}

output "kube_config" {
  value     = module.aks.kube_config_raw
  sensitive = true
}
