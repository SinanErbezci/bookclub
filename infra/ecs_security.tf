resource "aws_security_group" "ecs" {
  name        = "bookclub-ecs"
  description = "ECS task security group"
  vpc_id      = aws_vpc.main.id

  tags = local.common_tags
}

resource "aws_vpc_security_group_egress_rule" "ecs_all_outbound" {
  security_group_id = aws_security_group.ecs.id

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"

  tags = local.common_tags
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id = aws_security_group.ecs.id

  referenced_security_group_id = aws_security_group.alb.id

  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"

  tags = local.common_tags
}