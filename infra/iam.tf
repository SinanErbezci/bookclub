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
          "s3:ListBucket"
        ]

        Resource = aws_s3_bucket.deploy_assets.arn
      },
      {
        Effect = "Allow"

        Action = [
          "s3:GetObject"
        ]

        Resource = "${aws_s3_bucket.deploy_assets.arn}/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "deploy_assets_read" {
  role       = aws_iam_role.ec2.name
  policy_arn = aws_iam_policy.deploy_assets_read.arn
}

# github-action-role
resource "aws_iam_role" "github_actions" {
  name = "github-actions-bookclub"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      {
        Effect = "Allow"

        Principal = {
          Federated = "arn:aws:iam::796973519136:oidc-provider/token.actions.githubusercontent.com"
        }

        Action = "sts:AssumeRoleWithWebIdentity"

        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }

          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              "repo:SinanErbezci/bookclub:ref:refs/heads/main"
            ]
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "github_actions" {
  name = "github-actions-bookclub-policy"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [

      {
        Sid    = "ECRAccess"
        Effect = "Allow"

        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:CompleteLayerUpload",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:PutImage",
          "ecr:BatchGetImage"
        ]

        Resource = aws_ecr_repository.bookclub.arn
      },

      {
        Sid    = "ECRAuth"
        Effect = "Allow"

        Action = [
          "ecr:GetAuthorizationToken"
        ]

        Resource = "*"
      },

      {
        Sid    = "SSMAccess"
        Effect = "Allow"

        Action = [
          "ssm:SendCommand",
          "ssm:GetCommandInvocation",
          "ssm:ListCommandInvocations"
        ]

        Resource = "*"
      },

      # Frontend bucket

      {
        Sid    = "S3FrontendBucket"
        Effect = "Allow"

        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]

        Resource = "arn:aws:s3:::sinanbook.club"
      },

      {
        Sid    = "S3FrontendObjects"
        Effect = "Allow"

        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]

        Resource = "arn:aws:s3:::sinanbook.club/*"
      },

      # Deploy assets bucket

      {
        Sid    = "S3DeployAssetsBucket"
        Effect = "Allow"

        Action = [
          "s3:ListBucket",
          "s3:GetBucketLocation"
        ]

        Resource = aws_s3_bucket.deploy_assets.arn
      },

      {
        Sid    = "S3DeployAssetsObjects"
        Effect = "Allow"

        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]

        Resource = "${aws_s3_bucket.deploy_assets.arn}/*"
      },

      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"

        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetDistribution"
        ]

        Resource = "*"
      },

      {
        Sid    = "STSIdentity"
        Effect = "Allow"

        Action = [
          "sts:GetCallerIdentity"
        ]

        Resource = "*"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "github_actions" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions.arn
}

resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    "22ff89586561fc2d52f77491e9f1eff1b80be33e"
  ]

  tags = local.common_tags
}