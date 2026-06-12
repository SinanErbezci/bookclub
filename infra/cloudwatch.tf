resource "aws_cloudwatch_log_group" "web" {
  name              = "bookclub/web"
  retention_in_days = 30

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "nginx" {
  name              = "bookclub/nginx"
  retention_in_days = 30

  tags = local.common_tags
}