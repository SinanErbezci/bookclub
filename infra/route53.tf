resource "aws_route53_zone" "main" {
  name = "sinanbook.club"

  tags = local.common_tags
}

resource "aws_route53_record" "root" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "sinanbook.club"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.frontend.domain_name
    zone_id                = aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.sinanbook.club"
  type    = "A"

  alias {
    name                   = aws_lb.bookclub.dns_name
    zone_id                = aws_lb.bookclub.zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "www.sinanbook.club"
  type    = "CNAME"
  ttl     = 300

  records = [
    "sinanbook.club"
  ]
}