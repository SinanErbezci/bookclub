resource "aws_acm_certificate" "alb" {
  domain_name = "sinanbook.club"

  lifecycle {
    prevent_destroy = true
  }

  tags = local.common_tags
}

resource "aws_acm_certificate" "cloudfront" {
  provider = aws.us_east_1

  domain_name = "sinanbook.club"

  lifecycle {
    prevent_destroy = true
  }

  tags = local.common_tags
}