# IAM Role
resource "aws_iam_role" "ec2" {
  name        = "bookclub-ec2-role"
  description = "bookclub ec2 role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Service = "ec2.amazonaws.com"
        }

        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}
# Instance Profile
resource "aws_iam_instance_profile" "ec2" {
  name = "bookclub-ec2-role"

  role = aws_iam_role.ec2.name

  tags = local.common_tags
}
# Managed Policy Attachments
resource "aws_iam_role_policy_attachment" "cloudwatch" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_role_policy_attachment" "ecr" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_policy" "deploy_assets_read" {
  name = "bookclub-deploy-assets-read"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.deploy_assets.arn,
          "${aws_s3_bucket.deploy_assets.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "deploy_assets_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.deploy_assets_read.arn
}