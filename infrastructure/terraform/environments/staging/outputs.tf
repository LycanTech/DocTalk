output "aks_cluster_name" {
  value = module.aks.cluster_name
}

output "postgres_fqdn" {
  value = module.postgres.fqdn
}

output "database_url" {
  value     = module.postgres.database_url
  sensitive = true
}

output "oidc_issuer_url" {
  value = module.aks.oidc_issuer_url
}

output "kube_config" {
  value     = module.aks.kube_config_raw
  sensitive = true
}
