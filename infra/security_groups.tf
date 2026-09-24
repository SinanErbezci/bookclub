resource "aws_security_group" "rds" {
  count = var.production_enabled ? 1 : 0

  name        = "${var.project_name}-rds"
  description = "Security group for BookClub RDS PostgreSQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL from EKS"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"

    security_groups = [
      aws_eks_cluster.bookclub[0].vpc_config[0].cluster_security_group_id
    ]
  }

  egress {
    description = "Allow outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = local.common_tags
}