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

resource "aws_iam_role" "eks_django_ssm" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-eks-django-ssm"

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

resource "aws_iam_role_policy" "eks_django_ssm" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-eks-django-ssm"
  role = aws_iam_role.eks_django_ssm[0].id

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Action = [
        "ssm:GetParameters",
        "ssm:GetParameter",
      ]

      Resource = [
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/DATABASE_URL",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/DJANGO_SECRET_KEY",
        "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/OPENAI_API_KEY"
      ]
    }]
  })
}

resource "aws_eks_pod_identity_association" "django" {
  count = var.production_enabled ? 1 : 0

  cluster_name    = aws_eks_cluster.bookclub[0].name
  namespace       = "default"
  service_account = "django"
  role_arn        = aws_iam_role.eks_django_ssm[0].arn
}

