output "resource_group" {
  value = azurerm_resource_group.site.name
}

output "registry_login_server" {
  value = azurerm_container_registry.site.login_server
}

output "app_name" {
  value = local.deploy_app ? azurerm_container_app.site[0].name : null
}

# The stable hostname of the app, which is what the Cloudflare record points
# at. Not latest_revision_fqdn: that one changes with every deploy.
output "app_fqdn" {
  value = local.deploy_app ? azurerm_container_app.site[0].ingress[0].fqdn : null
}

# Value for the `asuid.<hostname>` TXT record that proves ownership of a
# custom domain before it can be bound.
output "domain_verification_id" {
  value = azurerm_container_app_environment.site.custom_domain_verification_id
}

output "environment_static_ip" {
  value = azurerm_container_app_environment.site.static_ip_address
}

output "site_identity_client_id" {
  value = azurerm_user_assigned_identity.site.client_id
}
