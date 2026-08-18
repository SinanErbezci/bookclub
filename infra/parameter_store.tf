resource "aws_iam_policy" "parameter_store_read" {
  name = "bookclub-parameter-store-read"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Action = [
          "ssm:GetParameter"
        ]

        Resource = "arn:aws:ssm:${var.aws_region}:${data.aws_caller_identity.current.account_id}:parameter/bookclub/production/env"
      }
    ]
  })
}

data "aws_caller_identity" "current" {}