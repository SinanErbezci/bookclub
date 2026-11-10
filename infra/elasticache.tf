
resource "aws_security_group" "redis" {
  count = var.production_enabled ? 1 : 0

  name        = "${var.project_name}-redis"
  description = "Security group for BookClub ElastiCache"
  vpc_id      = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-redis"
  })
}

resource "aws_vpc_security_group_ingress_rule" "redis_from_eks" {
  count = var.production_enabled ? 1 : 0

  security_group_id = aws_security_group.redis[0].id

  referenced_security_group_id = aws_eks_cluster.bookclub[0].vpc_config[0].cluster_security_group_id

  ip_protocol = "tcp"
  from_port   = 6379
  to_port     = 6379
}

resource "aws_elasticache_subnet_group" "redis" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-redis"

  subnet_ids = [
    aws_subnet.private_a.id,
    aws_subnet.private_b.id
  ]

  tags = local.common_tags
}

resource "aws_elasticache_replication_group" "redis" {
  count = var.production_enabled ? 1 : 0

  replication_group_id = "${var.project_name}-redis"

  description = "BookClub Redis cache"

  engine         = "redis"
  engine_version = "7.1"

  node_type = "cache.t4g.micro"

  num_cache_clusters = 1

  port = 6379

  subnet_group_name = aws_elasticache_subnet_group.redis[0].name

  security_group_ids = [
    aws_security_group.redis[0].id
  ]

  automatic_failover_enabled = false
  multi_az_enabled           = false

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  tags = local.common_tags
}