resource "aws_ecr_repository" "bookclub_test" {
  name = "bookclub-test"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Project = "Bookclub"
    Managed = "Terraform"
  }
}