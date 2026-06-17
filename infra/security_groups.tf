resource "aws_security_group" "ec2" {
  name        = "bookclub-ec2"
  description = "EC2 security group"

  vpc_id = aws_vpc.main.id

  tags = local.common_tags
}

resource "aws_security_group" "alb" {
  name        = "bookclub-alb"
  description = "ALB security group"

  vpc_id = aws_vpc.main.id

  tags = local.common_tags
}

resource "aws_vpc_security_group_egress_rule" "ec2_all_outbound" {

  security_group_id = aws_security_group.ec2.id

  ip_protocol = "-1"

  cidr_ipv4 = "0.0.0.0/0"

}

resource "aws_vpc_security_group_ingress_rule" "http_from_alb" {

  security_group_id = aws_security_group.ec2.id

  ip_protocol = "tcp"

  from_port = 80
  to_port   = 80

  referenced_security_group_id = aws_security_group.alb.id

}


resource "aws_vpc_security_group_ingress_rule" "alb_http" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"

  from_port = 80
  to_port   = 80

  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "tcp"

  from_port = 443
  to_port   = 443

  cidr_ipv4 = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "alb_all_outbound" {

  security_group_id = aws_security_group.alb.id

  ip_protocol = "-1"

  cidr_ipv4 = "0.0.0.0/0"
}