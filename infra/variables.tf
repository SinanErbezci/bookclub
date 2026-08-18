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

variable "production_enabled" {
  description = "Enable production infrastructure and billable resources."
  type        = bool
  default     = false
}

variable "backend_image_tag" {
  description = "Docker image tag for the BookClub backend container."
  type        = string
  default     = "latest"
}