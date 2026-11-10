data "aws_ssm_parameter" "eks_al2023_ami" {
  count = var.production_enabled ? 1 : 0
  name  = "/aws/service/eks/optimized-ami/${aws_eks_cluster.bookclub[0].version}/amazon-linux-2023/x86_64/standard/recommended/image_id"
}

resource "aws_eks_cluster" "bookclub" {
  count = var.production_enabled ? 1 : 0

  name     = "${var.project_name}-eks"
  role_arn = aws_iam_role.eks_cluster[0].arn
  version  = "1.36"

  bootstrap_self_managed_addons = false

  upgrade_policy {
    support_type = "STANDARD"
  }

  access_config {
    authentication_mode                         = "API"
    bootstrap_cluster_creator_admin_permissions = false
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

resource "aws_eks_access_entry" "bookclub_user" {
  count = var.production_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.bookclub[0].name
  principal_arn = "arn:aws:iam::796973519136:user/bookclub-user"
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "bookclub_user_admin" {
  count = var.production_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.bookclub[0].name
  principal_arn = aws_eks_access_entry.bookclub_user[0].principal_arn

  policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}

resource "aws_launch_template" "eks_nodes" {
  count = var.production_enabled ? 1 : 0

  name_prefix = "${var.project_name}-eks-node-"

  image_id = data.aws_ssm_parameter.eks_al2023_ami[0].value

  user_data = base64encode(<<-EOT
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="//"

--//
Content-Type: application/node.eks.aws

---
apiVersion: node.eks.aws/v1alpha1
kind: NodeConfig
spec:
  cluster:
    name: ${aws_eks_cluster.bookclub[0].name}
    apiServerEndpoint: ${aws_eks_cluster.bookclub[0].endpoint}
    certificateAuthority: ${aws_eks_cluster.bookclub[0].certificate_authority[0].data}
    cidr: ${aws_eks_cluster.bookclub[0].kubernetes_network_config[0].service_ipv4_cidr}
  kubelet:
    config:
      maxPods: 110

--//--
EOT
  )

  tag_specifications {
    resource_type = "instance"

    tags = merge(local.common_tags, {
      Name = "${var.project_name}-eks-node"
    })
  }

  tags = local.common_tags
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

  launch_template {
    id      = aws_launch_template.eks_nodes[0].id
    version = aws_launch_template.eks_nodes[0].latest_version
  }

  scaling_config {
    desired_size = 2
    min_size     = 1
    max_size     = 2
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_ecr,
  ]

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-eks-node"
  })
}

resource "aws_eks_addon" "vpc_cni" {
  count = var.production_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.bookclub[0].name
  addon_name    = "vpc-cni"
  addon_version = "v1.22.4-eksbuild.3"

  configuration_values = jsonencode({
    env = {
      ENABLE_PREFIX_DELEGATION = "true"
      WARM_PREFIX_TARGET       = "1"
    }
  })

  depends_on = [
    aws_eks_cluster.bookclub
  ]
}

resource "aws_eks_addon" "coredns" {
  count = var.production_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.bookclub[0].name
  addon_name    = "coredns"
  addon_version = "v1.14.6-eksbuild.4"

  depends_on = [
    aws_eks_cluster.bookclub
  ]
}

resource "aws_eks_addon" "kube_proxy" {
  count = var.production_enabled ? 1 : 0

  cluster_name  = aws_eks_cluster.bookclub[0].name
  addon_name    = "kube-proxy"
  addon_version = "v1.36.0-eksbuild.25"

  depends_on = [
    aws_eks_cluster.bookclub
  ]
}

resource "aws_eks_addon" "pod_identity_agent" {
  count = var.production_enabled ? 1 : 0

  cluster_name = aws_eks_cluster.bookclub[0].name
  addon_name   = "eks-pod-identity-agent"

  depends_on = [
    aws_eks_node_group.bookclub
  ]
}

resource "aws_eks_addon" "ebs_csi_driver" {
  count = var.production_enabled ? 1 : 0

  cluster_name = aws_eks_cluster.bookclub[0].name
  addon_name   = "aws-ebs-csi-driver"

  depends_on = [
    aws_eks_node_group.bookclub,
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy_attachment.ebs_csi_driver
  ]
}

resource "aws_eks_pod_identity_association" "aws_load_balancer_controller" {
  count = var.production_enabled ? 1 : 0

  cluster_name    = aws_eks_cluster.bookclub[0].name
  namespace       = "kube-system"
  service_account = "aws-load-balancer-controller"

  role_arn = aws_iam_role.aws_load_balancer_controller[0].arn

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy_attachment.aws_load_balancer_controller
  ]
}

