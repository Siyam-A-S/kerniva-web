variable "region" {
  type    = string
  default = "us-east-1"
}

variable "environment" {
  description = "nonprod or production. Production serves the apex domain; others serve <environment>.<domain>."
  type        = string
}

variable "domain" {
  type    = string
  default = "kerniva.app"
}
