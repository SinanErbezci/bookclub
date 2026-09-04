data "terraform_remote_state" "infra" {
  backend = "s3"

  config = {
    bucket = "sinan-bookclub-terraform-state"
    key    = "bookclub/terraform.tfstate"
    region = "eu-west-3"
  }
}