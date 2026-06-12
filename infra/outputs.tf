output "ecr_repository_name" {
  value = aws_ecr_repository.bookclub.repository_url
}

output "bookclub_v2_public_ip" {
  description = "Public IP of the bookclub-v2 instance"
  value       = aws_instance.web.public_ip
}

output "bookclub_v2_public_dns" {
  description = "Public DNS of the bookclub-v2 instance"
  value       = aws_instance.web.public_dns
}

output "loadbalancer_arn" {
  description = "Arn of loadbalancer"
  value       = aws_lb.bookclub.arn
}

output "target_group_arn" {
  description = "Bookclub target group ARN"
  value       = aws_lb_target_group.bookclub.arn
}

output "hosted_zone_id" {
  value = aws_route53_zone.main.zone_id
}