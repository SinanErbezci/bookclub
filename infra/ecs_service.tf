resource "aws_ecs_service" "bookclub" {
  count = var.production_enabled ? 1 : 0

  name = "bookclub"

  cluster = aws_ecs_cluster.bookclub.id

  task_definition = aws_ecs_task_definition.bookclub.arn

  desired_count = 1

  launch_type = "FARGATE"

  platform_version = "LATEST"

  network_configuration {
    subnets = [
      aws_subnet.private_a.id,
      aws_subnet.private_b.id
    ]

    security_groups = [
      aws_security_group.ecs.id
    ]

    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.bookclub[0].arn

    container_name = "nginx"

    container_port = 80
  }

  depends_on = [
    aws_lb_listener.https
  ]

  tags = local.common_tags
}