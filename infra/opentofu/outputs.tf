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

# The records to publish in DNS so Azure will send as the domain: one TXT that
# proves ownership, an SPF value, and two DKIM CNAMEs.
output "mail_dns_records" {
  value = azurerm_email_communication_service_domain.kerniva.verification_records
}

# First part of the SMTP username, which is
# <this>.<application (client) id>.<tenant id>.
output "mail_service_name" {
  value = azurerm_communication_service.mail.name
}
