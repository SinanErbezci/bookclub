variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "ecr_name" {
  description = "ECR Repo Name"
  type        = string
}

variable "base_ami" {
  description = "BookClub base AMI ID"
  type        = string
}