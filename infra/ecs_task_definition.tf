resource "aws_ecs_task_definition" "bookclub" {
  family = "bookclub"

  requires_compatibilities = [
    "FARGATE"
  ]

  network_mode = "awsvpc"

  cpu    = "512"
  memory = "1024"

  execution_role_arn = aws_iam_role.ecs_task_execution.arn

  container_definitions = jsonencode([
    {
      name  = "web"
      image = "${aws_ecr_repository.bookclub.repository_url}:${var.backend_image_tag}"

      essential = true

      secrets = [
        {
          name      = "DATABASE_URL"
          valueFrom = "/bookclub/production/DATABASE_URL"
        },
        {
          name      = "DJANGO_SECRET_KEY"
          valueFrom = "/bookclub/production/DJANGO_SECRET_KEY"
        },
        {
          name      = "DJANGO_SETTINGS_MODULE"
          valueFrom = "/bookclub/production/DJANGO_SETTINGS_MODULE"
        },
        {
          name      = "DJANGO_ALLOWED_HOSTS"
          valueFrom = "/bookclub/production/DJANGO_ALLOWED_HOSTS"
        }
      ]
      command = [
        "gunicorn",
        "mysite.wsgi:application",
        "--bind",
        "0.0.0.0:8000"
      ]

      portMappings = [
        {
          containerPort = 8000
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = aws_cloudwatch_log_group.web.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "web"
        }
      }
    },

    {
      name  = "nginx"
      image = "${aws_ecr_repository.bookclub.repository_url}:nginx"

      essential = true

      dependsOn = [
        {
          containerName = "web"
          condition     = "START"
        }
      ]
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"

        options = {
          awslogs-group         = aws_cloudwatch_log_group.nginx.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "nginx"
        }
      }

    }
  ])

  tags = local.common_tags
}
