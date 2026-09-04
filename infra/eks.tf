resource "aws_eks_cluster" "bookclub" {
  count = var.production_enabled ? 1 : 0

  name     = "${var.project_name}-eks"
  role_arn = aws_iam_role.eks_cluster[0].arn
  version  = "1.36"

  upgrade_policy {
    support_type = "STANDARD"
  }

  vpc_config {
    subnet_ids = [
      aws_subnet.private_a.id,
      aws_subnet.private_b.id
    ]
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

resource "aws_eks_node_group" "bookclub" {
  count = var.production_enabled ? 1 : 0

  cluster_name    = aws_eks_cluster.bookclub[0].name
  node_group_name = "${var.project_name}-nodes"
  node_role_arn   = aws_iam_role.eks_node[0].arn

  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id,
  ]

  instance_types = ["t3.medium"]
  capacity_type  = "ON_DEMAND"

  scaling_config {
    desired_size = 1
    min_size     = 1
    max_size     = 2
  }

  disk_size = 20

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_ecr
  ]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-eks-node"
  })
}

resource "aws_eks_addon" "pod_identity_agent" {
  count = var.production_enabled ? 1 : 0

  cluster_name = aws_eks_cluster.bookclub[0].name
  addon_name   = "eks-pod-identity-agent"

  depends_on = [
    aws_eks_node_group.bookclub
  ]
}