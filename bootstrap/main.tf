module "terraform_state" {
  source = "./modules/terraform-state-bucket"

  bucket_name = var.state_bucket_name
}