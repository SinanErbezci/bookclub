provider "aws" {
  region = var.aws_region
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "helm" {
  kubernetes = {
    host = aws_eks_cluster.bookclub[0].endpoint
    cluster_ca_certificate = base64decode(
      aws_eks_cluster.bookclub[0].certificate_authority[0].data
    )

    exec = {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        aws_eks_cluster.bookclub[0].name,
        "--region",
        var.aws_region
      ]
    }
  }
}