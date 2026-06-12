resource "aws_lb" "bookclub" {
  name               = "bookclub-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [aws_security_group.alb.id]

  subnets = [
    "subnet-0189105bc05b188e0",
    "subnet-0073e6c08bfc14274",
    "subnet-0ed286b4f00553381",
  ]

  tags = local.common_tags

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_lb_target_group" "bookclub" {
  name     = "bookclub-target"
  port     = 80
  protocol = "HTTP"
  vpc_id   = "vpc-02871713f3675bb3e"

  health_check {
    enabled             = true
    path                = "/health/"
    healthy_threshold   = 5
    unhealthy_threshold = 2
  }

  lifecycle {
    prevent_destroy = true
  }

  tags = local.common_tags
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.bookclub.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      protocol    = "HTTPS"
      port        = "443"
      host        = "#{host}"
      path        = "/#{path}"
      query       = "#{query}"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.bookclub.arn

  port            = 443
  protocol        = "HTTPS"
  ssl_policy      = "ELBSecurityPolicy-TLS13-1-2-Res-PQ-2025-09"
  certificate_arn = aws_acm_certificate.alb.arn

  default_action {
    type = "forward"

    forward {
      target_group {
        arn    = aws_lb_target_group.bookclub.arn
        weight = 1
      }

      stickiness {
        enabled  = false
        duration = 3600
      }
    }
  }
}

resource "aws_lb_target_group_attachment" "web" {
  target_group_arn = aws_lb_target_group.bookclub.arn
  target_id        = aws_instance.web.id
  port             = 80
}