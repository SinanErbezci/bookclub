resource "kubernetes_service_account" "django" {
  metadata {
    name      = "django"
    namespace = "default"
  }

  depends_on = [
    data.terraform_remote_state.infra
  ]
}

resource "kubernetes_deployment" "django" {
  metadata {
    name      = "django"
    namespace = "default"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "django"
      }
    }

    template {
      metadata {
        labels = {
          app = "django"
        }
      }

      spec {
        service_account_name = kubernetes_service_account.django.metadata[0].name

        container {
          name  = "django"
          image = "796973519136.dkr.ecr.eu-west-3.amazonaws.com/bookclub:eks-django"

          port {
            container_port = 8000
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }

          env_from {
            secret_ref {
              name = "django-secrets"
            }
          }

          env {
            name  = "DJANGO_ALLOWED_HOSTS"
            value = "api.sinanerbezci.com"
          }

          env {
            name  = "AI_SERVICE_URL"
            value = "http://ai-service:8001"
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_manifest.django_external_secret
  ]
}

resource "kubernetes_service" "django" {
  metadata {
    name      = "django"
    namespace = "default"
  }

  spec {
    selector = {
      app = "django"
    }

    port {
      port        = 8000
      target_port = 8000
    }

    type = "ClusterIP"
  }
}