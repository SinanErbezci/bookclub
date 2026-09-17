resource "aws_sqs_queue" "celery_dlq" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-celery-dlq"

  message_retention_seconds = 345600 # 4 days

  sqs_managed_sse_enabled = true

  tags = local.common_tags
}


resource "aws_sqs_queue" "celery" {
  count = var.production_enabled ? 1 : 0

  name = "${var.project_name}-celery"

  visibility_timeout_seconds = 3600
  message_retention_seconds  = 345600

  receive_wait_time_seconds = 20

  sqs_managed_sse_enabled = true

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.celery_dlq[0].arn
    maxReceiveCount     = 5
  })

  tags = local.common_tags
}