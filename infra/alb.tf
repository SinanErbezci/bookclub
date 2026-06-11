# resource "aws_lb" "bookclub" {
#   name               = "bookclub-alb"
#   internal           = false
#   load_balancer_type = "application"

#   security_groups = [aws_security_group.alb.id]

#   subnets = [
#     # your public subnet ids
#   ]

#   tags = local.common_tags
# }