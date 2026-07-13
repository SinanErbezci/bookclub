locals {
  common_tags = {
    Project     = "Bookclub"
    Managed     = "Terraform"
    Environment = "Production"
  }

  frontend_domain = "bookclub.sinanerbezci.com"
  api_domain      = "api.sinanerbezci.com"
}