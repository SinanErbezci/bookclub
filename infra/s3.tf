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