# resource "aws_lb" "bookclub" {
#   count = var.production_enabled ? 1 : 0

#   name = "bookclub-alb"

#   load_balancer_type = "application"

#   subnets = [
#     aws_subnet.public_a.id,
#     aws_subnet.public_b.id
#   ]

#   security_groups = [
#     aws_security_group.alb.id
#   ]

#   tags = local.common_tags
# }

# resource "aws_lb_target_group" "bookclub" {
#   count = var.production_enabled ? 1 : 0

#   name = "bookclub-target"

#   port     = 80
#   protocol = "HTTP"

#   vpc_id = aws_vpc.main.id

#   target_type = "ip"

#   health_check {
#     path = "/health/"
#   }

#   tags = local.common_tags
# }

# resource "aws_lb_listener" "https" {
#   count = var.production_enabled ? 1 : 0

#   load_balancer_arn = aws_lb.bookclub[0].arn

#   port     = 443
#   protocol = "HTTPS"

#   certificate_arn = aws_acm_certificate.alb.arn

#   default_action {
#     type = "forward"

#     target_group_arn = aws_lb_target_group.bookclub[0].arn
#   }

#   tags = local.common_tags
# }

# resource "aws_lb_listener" "http" {
#   count = var.production_enabled ? 1 : 0

#   load_balancer_arn = aws_lb.bookclub[0].arn

#   port     = 80
#   protocol = "HTTP"

#   default_action {
#     type = "redirect"

#     redirect {
#       port        = "443"
#       protocol    = "HTTPS"
#       status_code = "HTTP_301"
#     }
#   }

#   tags = local.common_tags
# }