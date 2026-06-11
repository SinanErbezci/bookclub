resource "aws_route53_zone" "main" {
  name = "sinanbook.club"

  tags = local.common_tags
}