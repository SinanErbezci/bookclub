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


resource "aws_ssm_parameter" "openai_api_key" {
  name  = "/bookclub/production/OPENAI_API_KEY"
  type  = "SecureString"
  value = "MANAGED_OUTSIDE_TERRAFORM"

  lifecycle {
    ignore_changes = [value]
  }

  tags = local.common_tags
}

resource "aws_ssm_parameter" "redis_url" {
  count = var.production_enabled ? 1 : 0

  name = "/bookclub/production/REDIS_URL"
  type = "SecureString"

  value = "rediss://${aws_elasticache_replication_group.redis[0].primary_endpoint_address}:6379/0"

  tags = local.common_tags
}