resource "aws_ssm_parameter" "production_env" {
  name        = "/bookclub/production/env"
  description = "Bookclub production environment variables"
  type        = "SecureString"

  value = "INITIALIZE_ME"

  lifecycle {
    ignore_changes = [value]
  }

  tags = {
    Project     = "Bookclub"
    Environment = "Production"
  }
}