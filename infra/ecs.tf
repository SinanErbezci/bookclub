resource "aws_ecs_cluster" "bookclub" {
  name = "bookclub"

  tags = local.common_tags
}