resource "aws_security_group" "alb" {
  name        = "bookclub-alb-sg"
  description = "Security group for ALB"
  vpc_id      = data.aws_vpc.default.id

  tags = local.common_tags
}