#!/bin/bash

# Destroys the ephemeral compute layer (EC2 + ALB).
# Permanent infrastructure (Route53, ACM, CloudFront, S3, ECR, IAM, SSM)
# remains intact to minimize costs while preserving the public endpoint.

set -euo pipefail

terraform -chdir=infra destroy -auto-approve \
  -target=aws_lb_target_group_attachment.web \
  -target=aws_lb_listener.http \
  -target=aws_lb_listener.https \
  -target=aws_lb.bookclub \
  -target=aws_lb_target_group.bookclub \
  -target=aws_instance.web