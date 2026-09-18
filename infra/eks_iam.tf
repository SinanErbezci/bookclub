resource "aws_iam_role" "eks_cluster" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  count = var.production_enabled ? 1 : 0

  role       = aws_iam_role.eks_cluster[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role" "eks_node" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node" {
  count = var.production_enabled ? 1 : 0

  role       = aws_iam_role.eks_node[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "eks_cni" {
  count = var.production_enabled ? 1 : 0

  role       = aws_iam_role.eks_node[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "eks_ecr" {
  count = var.production_enabled ? 1 : 0

  role       = aws_iam_role.eks_node[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role" "external_secrets" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-external-secrets"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "pods.eks.amazonaws.com"
      }

      Action = [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "external_secrets" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-external-secrets"
  role = aws_iam_role.external_secrets[0].id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Action = [
        "ssm:GetParameters",
        "ssm:GetParameter"
      ]

      Resource = [
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/DATABASE_URL",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/DJANGO_SECRET_KEY",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/OPENAI_API_KEY",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/CLOUDFLARE_API_TOKEN",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/REDIS_URL",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/CELERY_QUEUE_URL",
      ]
    }]
  })
}


resource "aws_iam_policy" "aws_load_balancer_controller" {
  count = var.production_enabled ? 1 : 0

  name   = "${var.project_name}-aws-load-balancer-controller"
  policy = file("${path.module}/aws-load-balancer-controller-policy.json")

  tags = local.common_tags
}

resource "aws_iam_role" "aws_load_balancer_controller" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-aws-load-balancer-controller"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Service = "pods.eks.amazonaws.com"
      }

      Action = [
        "sts:AssumeRole",
        "sts:TagSession"
      ]
    }]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  count = var.production_enabled ? 1 : 0

  role       = aws_iam_role.aws_load_balancer_controller[0].name
  policy_arn = aws_iam_policy.aws_load_balancer_controller[0].arn
}

resource "aws_iam_role" "django" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-django"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "pods.eks.amazonaws.com"
        }

        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "django_sqs" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-django-sqs"
  role = aws_iam_role.django[0].id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ]

        Resource = aws_sqs_queue.celery[0].arn
      }
    ]
  })
}

resource "aws_iam_role" "celery_worker" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-celery-worker"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "pods.eks.amazonaws.com"
        }

        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy" "celery_worker_sqs" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-celery-worker-sqs"
  role = aws_iam_role.celery_worker[0].id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:ChangeMessageVisibility",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:SendMessage"
        ]

        Resource = aws_sqs_queue.celery[0].arn
      },
      {
        Effect = "Allow"

        Action = [
          "ses:SendRawEmail",
          "ses:SendEmail",
        ]

        Resource = "arn:aws:ses:eu-west-3:796973519136:identity/sinanerbezci.com"
      }
    ]
  })
}

resource "aws_eks_pod_identity_association" "django" {
  count = var.production_enabled ? 1 : 0

  cluster_name    = aws_eks_cluster.bookclub[0].name
  namespace       = "default"
  service_account = "django"

  role_arn = aws_iam_role.django[0].arn

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy.django_sqs
  ]
}

resource "aws_eks_pod_identity_association" "celery_worker" {
  count = var.production_enabled ? 1 : 0

  cluster_name    = aws_eks_cluster.bookclub[0].name
  namespace       = "default"
  service_account = "celery-worker"

  role_arn = aws_iam_role.celery_worker[0].arn

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy.celery_worker_sqs
  ]
}