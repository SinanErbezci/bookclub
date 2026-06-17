# import {
#   to = aws_cloudfront_distribution.frontend
#   id = "EH3D8W39CTVDM"
# }

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "sinanbook.club.s3.us-east-1.amazonaws.com"
  description                       = ""
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"

  lifecycle {
    prevent_destroy = true
  }

}

resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2"
  default_root_object = "index.html"
  price_class         = "PriceClass_All"
  web_acl_id          = "arn:aws:wafv2:us-east-1:796973519136:global/webacl/CreatedByCloudFront-0662ba61/830b47ea-1c50-4205-9129-f305bc78e2ec"

  aliases = [
    "sinanbook.club",
    "www.sinanbook.club",
  ]

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "sinanbook.club.s3.us-east-1.amazonaws.com-mq0fd0ttufl"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id

    connection_attempts = 3
    connection_timeout  = 10
  }

  default_cache_behavior {
    target_origin_id       = "sinanbook.club.s3.us-east-1.amazonaws.com-mq0fd0ttufl"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    compress         = true
    min_ttl          = 0
    default_ttl      = 0
    max_ttl          = 0
    smooth_streaming = false

    grpc_config {
      enabled = false
    }
  }

  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = merge(local.common_tags, {
    Name = "bookclub-frontend"
  })
}