#!/bin/bash

set -euo pipefail

cd /opt/bookclub

aws ssm get-parameter \
    --name "/bookclub/production/env" \
    --with-decryption \
    --query Parameter.Value \
    --output text \
    > .env

TOKEN=$(curl -s -X PUT \
  "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

PRIVATE_IP=$(curl -s \
  -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/local-ipv4)

printf "\nEC2_PRIVATE_IP=%s\n" "$PRIVATE_IP" >> .env

chmod 600 .env

aws ecr get-login-password --region eu-west-3 \
| docker login \
    --username AWS \
    --password-stdin 796973519136.dkr.ecr.eu-west-3.amazonaws.com

docker compose pull

docker compose up -d --force-recreate --remove-orphans

docker image prune -f