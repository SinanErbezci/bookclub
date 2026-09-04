resource "helm_release" "external_secrets" {
  name             = "external-secrets"
  repository       = "https://charts.external-secrets.io"
  chart            = "external-secrets"
  namespace        = "external-secrets"
  create_namespace = true

  depends_on = [
    data.terraform_remote_state.infra
  ]
}

resource "aws_eks_pod_identity_association" "external_secrets" {
  cluster_name    = data.terraform_remote_state.infra.outputs.eks_cluster_name
  namespace       = "external-secrets"
  service_account = "external-secrets"
  role_arn        = data.terraform_remote_state.infra.outputs.external_secrets_role_arn

  depends_on = [
    helm_release.external_secrets
  ]
}

resource "kubernetes_manifest" "aws_ssm_store" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "SecretStore"

    metadata = {
      name      = "aws-ssm"
      namespace = "default"
    }

    spec = {
      provider = {
        aws = {
          service = "ParameterStore"
          region  = var.aws_region
        }
      }
    }
  }

  depends_on = [
    aws_eks_pod_identity_association.external_secrets
  ]
}

resource "kubernetes_manifest" "django_external_secret" {
  manifest = {
    apiVersion = "external-secrets.io/v1"
    kind       = "ExternalSecret"

    metadata = {
      name      = "django-secrets"
      namespace = "default"
    }

    spec = {
      refreshInterval = "1h"

      secretStoreRef = {
        name = "aws-ssm"
        kind = "SecretStore"
      }

      target = {
        name           = "django-secrets"
        creationPolicy = "Owner"
      }

      data = [
        {
          secretKey = "DATABASE_URL"

          remoteRef = {
            key = "/bookclub/production/DATABASE_URL"
          }
        },
        {
          secretKey = "DJANGO_SECRET_KEY"

          remoteRef = {
            key = "/bookclub/production/DJANGO_SECRET_KEY"
          }
        },
        {
          secretKey = "OPENAI_API_KEY"

          remoteRef = {
            key = "/bookclub/production/OPENAI_API_KEY"
          }
        }
      ]
    }
  }

  depends_on = [
    kubernetes_manifest.aws_ssm_store
  ]
}