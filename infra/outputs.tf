output "ecr_repository_name" {
  value = aws_ecr_repository.bookclub.repository_url
}

output "bookclub_v2_public_ip" {
  description = "Public IP of the bookclub-v2 instance"
  value       = aws_instance.bookclub_v2.public_ip
}

output "bookclub_v2_public_dns" {
  description = "Public DNS of the bookclub-v2 instance"
  value       = aws_instance.bookclub_v2.public_dns
}