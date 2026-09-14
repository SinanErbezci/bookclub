resource "helm_release" "external_secrets" {
  count            = var.production_enabled ? 1 : 0
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  version          = "2.10.0"
  namespace        = "external-secrets"
  create_namespace = true

  values = [
    yamlencode({
      serviceAccount = {
        create = true
        name   = "external-secrets"
      }
    })
  ]

  depends_on = [
    aws_eks_pod_identity_association.external_secrets[0],
    helm_release.aws_load_balancer_controller
  ]
}

resource "helm_release" "argocd" {
  count = var.production_enabled ? 1 : 0

  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "10.8.2"
  namespace        = "argocd"
  create_namespace = true

  depends_on = [
    helm_release.external_secrets
  ]
}

resource "aws_eks_pod_identity_association" "external_secrets" {
  count           = var.production_enabled ? 1 : 0
  cluster_name    = aws_eks_cluster.bookclub[0].name
  namespace       = "external-secrets"
  service_account = "external-secrets"
  role_arn        = aws_iam_role.external_secrets[0].arn

  depends_on = [
    aws_eks_addon.pod_identity_agent,
    aws_iam_role_policy.external_secrets
  ]
}

resource "helm_release" "metrics_server" {
  count = var.production_enabled ? 1 : 0

  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = "3.13.1"
  namespace  = "kube-system"

  depends_on = [
    aws_eks_node_group.bookclub
  ]
}

resource "helm_release" "aws_load_balancer_controller" {
  count = var.production_enabled ? 1 : 0

  name       = "aws-load-balancer-controller"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-load-balancer-controller"
  version    = "1.14.0"

  namespace = "kube-system"
  wait = true
  timeout = 300

  set = [
    {
      name  = "clusterName"
      value = aws_eks_cluster.bookclub[0].name
    },
    {
      name  = "vpcId"
      value = aws_vpc.main.id
    },
    {
      name  = "serviceAccount.create"
      value = "true"
    },
    {
      name  = "serviceAccount.name"
      value = "aws-load-balancer-controller"
    },
  ]
  depends_on = [
    aws_eks_pod_identity_association.aws_load_balancer_controller
  ]
}

resource "helm_release" "external_dns" {
  count = var.production_enabled ? 1 : 0

  name             = "external-dns"
  repository       = "https://kubernetes-sigs.github.io/external-dns/"
  chart            = "external-dns"
  version          = "1.21.1"
  namespace        = "external-dns"
  create_namespace = true

  wait = false
  
  values = [
    yamlencode({
      provider = {
        name = "cloudflare"
      }

      sources = [
        "ingress"
      ]

      domainFilters = [
        "sinanerbezci.com"
      ]

      zoneIdFilters = [
        "6d3bef7f6b9fbfe47a05b64fe5e210c6"
      ]

      policy = "upsert-only"

      registry = "txt"

      txtOwnerId = "bookclub-eks"

      serviceAccount = {
        create = true
        name   = "external-dns"
      }

      env = [
        {
          name = "CF_API_TOKEN"
          valueFrom = {
            secretKeyRef = {
              name = "external-dns-cloudflare"
              key  = "api-token"
            }
          }
        }
      ]
    })
  ]

  depends_on = [
    helm_release.argocd
  ]
}