resource "aws_acm_certificate" "alb" {
  domain_name = local.api_domain
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}

resource "aws_acm_certificate" "cloudfront" {
  provider = aws.us_east_1

  domain_name = local.frontend_domain
  validation_method = "DNS"
  lifecycle {
    create_before_destroy = true
  }

  tags = local.common_tags
}