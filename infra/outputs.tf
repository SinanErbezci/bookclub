output "ecr_repository_name" {
  value = aws_ecr_repository.bookclub.repository_url
}