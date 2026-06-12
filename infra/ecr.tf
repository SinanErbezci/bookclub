resource "aws_ecr_repository" "bookclub" {
  name = "bookclub"

  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = false
  }

}

resource "aws_ecr_lifecycle_policy" "bookclub" {
  repository = aws_ecr_repository.bookclub.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 30 images"

        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }

        action = {
          type = "expire"
        }
      }
    ]
  })
}