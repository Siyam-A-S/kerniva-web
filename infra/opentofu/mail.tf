# Outbound application mail: Azure Communication Services Email, sending as
# noreply@kerniva.app. It serves two senders, this site's forms API and the
# product demo's invitations, so it has a resource group of its own instead of
# living inside either. People's mail (contact@, sales@, every mailbox) stays
# on Google Workspace; only automated mail goes through here.
#
# It replaced Gmail SMTP with an app password, which tied every automated
# message to one person's account: their password, their 2-step verification,
# their Sent folder, their daily quota.

resource "azurerm_resource_group" "mail" {
  name     = var.mail_resource_group_name
  location = var.location
  tags     = merge(local.tags, { Component = "mail" })
}

# The email service holds the domain; the communication service is what a
# sender authenticates against. Both are global resources, and data_location
# is where message data is kept at rest, not a region.
resource "azurerm_email_communication_service" "mail" {
  name                = "ecs-kerniva"
  resource_group_name = azurerm_resource_group.mail.name
  data_location       = "United States"
  tags                = azurerm_resource_group.mail.tags
}

resource "azurerm_communication_service" "mail" {
  name                = var.mail_service_name
  resource_group_name = azurerm_resource_group.mail.name
  data_location       = "United States"
  tags                = azurerm_resource_group.mail.tags
}

# Customer managed: we send as our own domain, proven with the DNS records in
# the `mail_dns_records` output. Until they are published and verified the
# domain exists but nothing can send from it.
resource "azurerm_email_communication_service_domain" "kerniva" {
  name              = var.mail_domain
  email_service_id  = azurerm_email_communication_service.mail.id
  domain_management = "CustomerManaged"
  # Open and click tracking rewrites links and adds a pixel. These are
  # invitations and form notices, not campaigns.
  user_engagement_tracking_enabled = false
  tags                             = azurerm_resource_group.mail.tags
}

# Everything below needs the domain verified first, which needs DNS records
# only a person can publish. Set mail_domain_verified once
# `az communication email domain show` reports all four as Verified.
resource "azurerm_communication_service_email_domain_association" "kerniva" {
  count                    = var.mail_domain_verified ? 1 : 0
  communication_service_id = azurerm_communication_service.mail.id
  email_service_domain_id  = azurerm_email_communication_service_domain.kerniva.id
}

# The local part mail is sent from: noreply@<domain>. A From address that is
# not registered here is refused.
resource "azurerm_email_communication_service_domain_sender_username" "noreply" {
  count                   = var.mail_domain_verified ? 1 : 0
  name                    = "noreply"
  email_service_domain_id = azurerm_email_communication_service_domain.kerniva.id
  display_name            = "Kerniva"
}

# ---- who may send -------------------------------------------------------------------------------

# SMTP sign-in is an Entra application, not a mailbox: the username names the
# application and the password is one of its client secrets. This role is the
# least the SMTP endpoint needs, so a leaked secret can send mail and nothing
# else: it cannot read keys, change the domain, or touch any other resource.
resource "azurerm_role_definition" "mail_sender" {
  name        = "Kerniva mail sender"
  scope       = azurerm_communication_service.mail.id
  description = "Send email through the communication service over SMTP."

  permissions {
    actions = [
      "Microsoft.Communication/CommunicationServices/Read",
      "Microsoft.Communication/CommunicationServices/Write",
      "Microsoft.Communication/EmailServices/Write",
    ]
  }

  assignable_scopes = [azurerm_communication_service.mail.id]
}

# One application per sender (the site, the demo), created by hand like the
# pipeline's: app registrations are tenant objects. Separate applications mean
# separate secrets, so one can be rotated or revoked without touching the
# other.
resource "azurerm_role_assignment" "mail_sender" {
  for_each           = var.mail_sender_principal_ids
  scope              = azurerm_communication_service.mail.id
  role_definition_id = azurerm_role_definition.mail_sender.role_definition_resource_id
  principal_id       = each.value
  principal_type     = "ServicePrincipal"
}
