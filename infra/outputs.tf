output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "eks_cluster_name" {
  value = var.production_enabled ? aws_eks_cluster.bookclub[0].name : null
}

output "eks_cluster_endpoint" {
  value = var.production_enabled ? aws_eks_cluster.bookclub[0].endpoint : null
}

output "eks_cluster_ca" {
  value = var.production_enabled ? aws_eks_cluster.bookclub[0].certificate_authority[0].data : null
}

output "external_secrets_role_arn" {
  value = var.production_enabled ? aws_iam_role.external_secrets[0].arn : null
}