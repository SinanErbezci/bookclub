resource "aws_s3_bucket" "deploy_assets" {
  bucket = "sinan-bookclub-deploy-assets"

  tags = merge(local.common_tags, {
    Name = "bookclub-deploy-assets"
  })
}

resource "aws_s3_bucket_public_access_block" "deploy_assets" {
  bucket = aws_s3_bucket.deploy_assets.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "deploy_assets" {
  bucket = aws_s3_bucket.deploy_assets.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "sinanbook.club"

  tags = local.common_tags

  provider = aws.us_east_1
}

resource "aws_s3_bucket_policy" "frontend" {
  provider = aws.us_east_1
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2008-10-17"
    Id      = "PolicyForCloudFrontPrivateContent"

    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"

        Principal = {
          Service = "cloudfront.amazonaws.com"
        }

        Action = "s3:GetObject"

        Resource = "${aws_s3_bucket.frontend.arn}/*"

        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  provider = aws.us_east_1

  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  provider = aws.us_east_1

  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  provider = aws.us_east_1

  bucket = aws_s3_bucket.frontend.id

  rule {
    bucket_key_enabled = true

    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}