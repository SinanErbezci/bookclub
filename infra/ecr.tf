resource "aws_ecr_repository" "bookclub" {
  name = "bookclub"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

}