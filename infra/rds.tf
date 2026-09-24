resource "aws_db_instance" "bookclub" {
  count = var.production_enabled ? 1 : 0

  identifier = "${var.project_name}-db"

  engine         = "postgres"
  engine_version = "17"

  instance_class = "db.t4g.micro"

  allocated_storage = 20
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = "bookclub"
  username = "bookclub"

  manage_master_user_password = true

  db_subnet_group_name = aws_db_subnet_group.bookclub.name

  vpc_security_group_ids = [
    aws_security_group.rds[0].id
  ]

  publicly_accessible = false

  multi_az = false

  backup_retention_period = 7

  skip_final_snapshot = false

  final_snapshot_identifier = "${var.project_name}-final-snapshot"

  deletion_protection = false

  tags = local.common_tags
}