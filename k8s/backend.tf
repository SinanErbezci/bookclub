terraform {
  backend "s3" {
    bucket = "sinan-bookclub-terraform-state"
    key    = "bookclub/kubernetes/terraform.tfstate"
    region = "eu-west-3"
  }
}