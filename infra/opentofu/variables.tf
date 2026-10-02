variable "subscription_id" {
  description = "The Kerniva subscription, the one the product demo runs in. No default on purpose."
  type        = string
}

variable "tenant_id" {
  description = "The tenant that owns that subscription. No default on purpose."
  type        = string
}

variable "location" {
  description = "Not centralus, where the product demo runs: that region refused new Container Apps environments for lack of capacity. The site is behind Cloudflare, so its region matters little."
  type        = string
  default     = "eastus2"
}

variable "resource_group_name" {
  type    = string
  default = "rg-kerniva-site"
}

variable "name_prefix" {
  description = "Suffix for every resource name: ca-<prefix>, cae-<prefix>, id-<prefix>, log-<prefix>."
  type        = string
  default     = "kerniva-site"
}

variable "registry_name" {
  description = "Globally unique, letters and digits only."
  type        = string
  default     = "acrkernivasite"
}

variable "image" {
  description = "Full image reference for the first revision, e.g. acrkernivasite.azurecr.io/kerniva-site:sha-<commit>. Empty skips the app, which is how the first apply runs before any image exists. Later changes are ignored: the pipeline owns the tag."
  type        = string
  default     = ""
}

variable "deploy_principal_id" {
  description = "Object ID of the service principal behind the GitHub pipeline (Entra app gha-kerniva-site-deploy). Empty skips its role assignments."
  type        = string
  default     = ""
}

variable "allowed_origin" {
  description = "The one origin the forms API accepts posts from."
  type        = string
  default     = "https://kerniva.app"
}

variable "form_token_secret" {
  description = "Signs form tokens. Set through TF_VAR_form_token_secret; `openssl rand -hex 32`."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.form_token_secret) >= 32
    error_message = "form_token_secret must be at least 32 characters. Without a fixed secret every form open in a browser breaks on each deploy."
  }
}

variable "smtp_host" {
  type    = string
  default = "smtp.gmail.com"
}

variable "smtp_port" {
  type    = number
  default = 587
}

variable "smtp_user" {
  description = "The Google Workspace account that sends."
  type        = string
  default     = "noreply@kerniva.app"
}

variable "smtp_pass" {
  description = "That account's app password. Set through TF_VAR_smtp_pass. Empty deploys the site with forms refusing submissions."
  type        = string
  default     = ""
  sensitive   = true
}

variable "mail_from" {
  description = "From header. Keep it the same account as smtp_user, or Gmail rewrites it."
  type        = string
  default     = "Kerniva <noreply@kerniva.app>"
}

variable "confirmation_enabled" {
  description = "Acknowledge a delivered submission to the visitor."
  type        = bool
  default     = false
}

variable "hostnames" {
  description = "Custom hostnames to bind once the origin certificate is uploaded."
  type        = list(string)
  default     = ["kerniva.app"]
}

variable "origin_certificate_name" {
  description = "Name of the Cloudflare Origin CA certificate uploaded to the environment. Empty skips the custom domain binding."
  type        = string
  default     = ""
}

variable "ingress_allowed_cidrs" {
  description = "When non-empty, only these ranges reach the app. Set to Cloudflare's IPv4 ranges (https://www.cloudflare.com/ips-v4) after cutover."
  type        = list(string)
  default     = []
}
