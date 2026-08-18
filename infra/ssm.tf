resource "aws_ssm_parameter" "database_url" {
  name  = "/bookclub/production/DATABASE_URL"
  type  = "SecureString"
  value = "MANAGED_OUTSIDE_TERRAFORM"

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.common_tags
}

resource "aws_ssm_parameter" "django_secret_key" {
  name  = "/bookclub/production/DJANGO_SECRET_KEY"
  type  = "SecureString"
  value = "MANAGED_OUTSIDE_TERRAFORM"

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.common_tags
}

resource "aws_ssm_parameter" "django_settings_module" {
  name  = "/bookclub/production/DJANGO_SETTINGS_MODULE"
  type  = "SecureString"
  value = "MANAGED_OUTSIDE_TERRAFORM"

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.common_tags
}

resource "aws_ssm_parameter" "django_allowed_hosts" {
  name  = "/bookclub/production/DJANGO_ALLOWED_HOSTS"
  type  = "SecureString"
  value = "MANAGED_OUTSIDE_TERRAFORM"

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.common_tags
}