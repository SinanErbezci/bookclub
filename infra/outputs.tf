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

output "alb_dns_name" {
  value = aws_lb.bookclub.dns_name
}

output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}