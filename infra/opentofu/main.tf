terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
  }
  # Partial backend: `tofu init -backend-config=backend.hcl`. The values stay out
  # of the repository; the example keeps the shape reviewable.
  backend "azurerm" {}
}

provider "azurerm" {
  # Both set explicitly, with no defaults, so an apply can never land in
  # whichever subscription happens to be the CLI default. The login that runs
  # this can see a second subscription in another tenant.
  subscription_id = var.subscription_id
  tenant_id       = var.tenant_id
  features {}
}

locals {
  tags = {
    Product   = "Kerniva"
    Component = "site"
    ManagedBy = "opentofu"
  }

  # The app is created only once an image exists to run: a Container App cannot
  # be created pointing at a tag the registry does not hold. First apply builds
  # everything else, the pipeline pushes an image, the second apply names it.
  deploy_app = var.image != ""

  # Mail settings are passed only when there is a password. Without one the
  # API starts in dry run and refuses submissions with a message naming
  # contact@kerniva.app, which is the behaviour we want from a half-configured
  # deploy, instead of a transport that fails every send.
  mail_enabled = var.smtp_pass != ""
}

# Everything the marketing site needs lives in its own resource group, apart
# from the product demo in rg-kerniva-demo. Same subscription and tenant, but a
# demo rebuild cannot take the site down with it, the site's logs do not spend
# the demo's daily log cap, and this repository's pipeline holds no rights over
# the product's registry.
resource "azurerm_resource_group" "site" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

# ---- logs ---------------------------------------------------------------------------------------

resource "azurerm_log_analytics_workspace" "site" {
  name                = "log-${var.name_prefix}"
  location            = azurerm_resource_group.site.location
  resource_group_name = azurerm_resource_group.site.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  # A marketing site should never log much. The cap is what stops a crawler
  # storm, which nginx logs line by line, from becoming an ingestion bill.
  daily_quota_gb = 0.1
  tags           = local.tags
}

# ---- container apps environment -----------------------------------------------------------------

resource "azurerm_container_app_environment" "site" {
  name                = "cae-${var.name_prefix}"
  location            = azurerm_resource_group.site.location
  resource_group_name = azurerm_resource_group.site.name

  # Routed through Azure Monitor with the diagnostic setting below, not wired
  # straight to the workspace: the direct destination ignores the daily cap.
  logs_destination = "azure-monitor"

  tags = local.tags

  # Azure can briefly answer "not found" for a resource that exists, most
  # often after one of the same name was deleted and recreated. A plan built
  # on that answer wants to recreate the environment and replace the app in
  # it, which would take the site down and change its hostname. This turns
  # that plan into an error. To really remove it, delete this block first.
  lifecycle {
    prevent_destroy = true
  }
}

resource "azurerm_monitor_diagnostic_setting" "environment" {
  name                       = "to-log-analytics"
  target_resource_id         = azurerm_container_app_environment.site.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.site.id

  enabled_log {
    category = "ContainerAppConsoleLogs"
  }
  enabled_log {
    category = "ContainerAppSystemLogs"
  }
}

# ---- registry -----------------------------------------------------------------------------------

resource "azurerm_container_registry" "site" {
  name                = var.registry_name
  location            = azurerm_resource_group.site.location
  resource_group_name = azurerm_resource_group.site.name
  sku                 = "Basic"
  # No admin user: the app pulls with its managed identity and the pipeline
  # pushes with a federated credential, so there is no registry password.
  admin_enabled = false
  tags          = local.tags
}

# ---- identities and roles -----------------------------------------------------------------------

resource "azurerm_user_assigned_identity" "site" {
  name                = "id-${var.name_prefix}"
  location            = azurerm_resource_group.site.location
  resource_group_name = azurerm_resource_group.site.name
  tags                = local.tags
}

resource "azurerm_role_assignment" "site_pull" {
  scope                = azurerm_container_registry.site.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.site.principal_id
}

# The GitHub pipeline's service principal (Entra app gha-kerniva-site-deploy,
# created by hand: app registrations are tenant objects, not resources). It may
# push to this registry and roll this app, and nothing else in the
# subscription. Skipped until the principal exists.
resource "azurerm_role_assignment" "deploy_push" {
  count                = var.deploy_principal_id != "" ? 1 : 0
  scope                = azurerm_container_registry.site.id
  role_definition_name = "AcrPush"
  principal_id         = var.deploy_principal_id
  principal_type       = "ServicePrincipal"
}

resource "azurerm_role_assignment" "deploy_apps" {
  count                = var.deploy_principal_id != "" ? 1 : 0
  scope                = azurerm_resource_group.site.id
  role_definition_name = "Container Apps Contributor"
  principal_id         = var.deploy_principal_id
  principal_type       = "ServicePrincipal"
}

# Updating an app re-submits its identity block, and Azure checks that the
# caller may assign that identity. Without this the image update is refused
# with LinkedAuthorizationFailed.
resource "azurerm_role_assignment" "deploy_identity" {
  count                = var.deploy_principal_id != "" ? 1 : 0
  scope                = azurerm_user_assigned_identity.site.id
  role_definition_name = "Managed Identity Operator"
  principal_id         = var.deploy_principal_id
  principal_type       = "ServicePrincipal"
}

# ---- the site -----------------------------------------------------------------------------------

resource "azurerm_container_app" "site" {
  count = local.deploy_app ? 1 : 0

  name                         = "ca-${var.name_prefix}"
  resource_group_name          = azurerm_resource_group.site.name
  container_app_environment_id = azurerm_container_app_environment.site.id
  revision_mode                = "Single"
  tags                         = local.tags

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.site.id]
  }

  registry {
    server   = azurerm_container_registry.site.login_server
    identity = azurerm_user_assigned_identity.site.id
  }

  secret {
    name  = "form-token-secret"
    value = var.form_token_secret
  }

  dynamic "secret" {
    for_each = local.mail_enabled ? [1] : []
    content {
      name  = "smtp-pass"
      value = var.smtp_pass
    }
  }

  ingress {
    external_enabled = true
    # nginx listens on 80 inside the container; the platform terminates TLS.
    target_port = 80
    # Plain HTTP is refused at the platform. nginx's own bounce reads
    # Cloudflare's CF-Visitor header and keeps working behind this.
    allow_insecure_connections = false
    transport                  = "auto"

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }

    # Empty until cutover, so the default hostname can be smoke-tested. After
    # cutover this holds Cloudflare's published IPv4 ranges, which is what
    # makes the CF-Connecting-IP header nginx rate-limits on trustworthy: a
    # caller that bypasses Cloudflare could set it to anything.
    dynamic "ip_security_restriction" {
      for_each = var.ingress_allowed_cidrs
      content {
        name             = "cloudflare-${ip_security_restriction.key}"
        action           = "Allow"
        ip_address_range = ip_security_restriction.value
      }
    }
  }

  template {
    # Exactly one replica, always on. The forms API keeps its rate-limit
    # windows, its daily send cap and its spent form tokens in memory: a
    # second replica would double every limit and refuse tokens the first one
    # issued, and scaling to zero would reset the cap on every cold start.
    min_replicas = 1
    max_replicas = 1

    container {
      name   = "site"
      image  = var.image
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "ALLOWED_ORIGIN"
        value = var.allowed_origin
      }
      env {
        name        = "FORM_TOKEN_SECRET"
        secret_name = "form-token-secret"
      }
      env {
        name  = "MAIL_FROM"
        value = var.mail_from
      }
      env {
        name  = "CONFIRMATION_ENABLED"
        value = var.confirmation_enabled ? "true" : "false"
      }

      dynamic "env" {
        for_each = local.mail_enabled ? {
          SMTP_HOST = var.smtp_host
          SMTP_PORT = tostring(var.smtp_port)
          SMTP_USER = var.smtp_user
        } : {}
        content {
          name  = env.key
          value = env.value
        }
      }

      dynamic "env" {
        for_each = local.mail_enabled ? [1] : []
        content {
          name        = "SMTP_PASS"
          secret_name = "smtp-pass"
        }
      }

      # All three probes ask nginx, never /api/health. The forms API restarts
      # on its own inside the container; a probe that depended on it would
      # have the platform kill the site whenever mail is misconfigured.
      startup_probe {
        transport               = "HTTP"
        port                    = 80
        path                    = "/healthz"
        interval_seconds        = 2
        failure_count_threshold = 30
      }
      liveness_probe {
        transport               = "HTTP"
        port                    = 80
        path                    = "/healthz"
        interval_seconds        = 30
        failure_count_threshold = 3
      }
      readiness_probe {
        transport               = "HTTP"
        port                    = 80
        path                    = "/healthz"
        interval_seconds        = 10
        failure_count_threshold = 3
      }
    }
  }

  lifecycle {
    # See the environment above: a false "not found" must not replace the
    # running site.
    prevent_destroy = true

    # The pipeline owns the image tag: every push to main rolls a new
    # sha-tagged revision with `az containerapp update`. Without this the next
    # apply would roll the site back to whatever tag was last written here.
    ignore_changes = [template[0].container[0].image]
  }

  depends_on = [azurerm_role_assignment.site_pull]
}

# ---- custom domain ------------------------------------------------------------------------------

# The certificate is a Cloudflare Origin CA certificate, uploaded to the
# environment with `az containerapp env certificate upload` so its private key
# never enters state. It is used instead of an Azure managed certificate
# because Cloudflare stays in front of the site: a managed certificate has to
# reach the app directly to validate and to renew, and a proxied record
# prevents that.
data "azurerm_container_app_environment_certificate" "origin" {
  count                        = var.origin_certificate_name != "" ? 1 : 0
  name                         = var.origin_certificate_name
  container_app_environment_id = azurerm_container_app_environment.site.id
}

resource "azurerm_container_app_custom_domain" "site" {
  for_each = local.deploy_app && var.origin_certificate_name != "" ? toset(var.hostnames) : toset([])

  name                                     = each.value
  container_app_id                         = azurerm_container_app.site[0].id
  container_app_environment_certificate_id = data.azurerm_container_app_environment_certificate.origin[0].id
  certificate_binding_type                 = "SniEnabled"
}
