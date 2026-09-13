output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}

output "eks_cluster_name" {
  value = var.production_enabled ? aws_eks_cluster.bookclub[0].name : null
}