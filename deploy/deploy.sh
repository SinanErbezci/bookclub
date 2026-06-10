#!/bin/bash

set -euo pipefail

cd /opt/bookclub

aws ssm get-parameter \
    --name "/bookclub/production/env" \
    --with-decryption \
    --query Parameter.Value \
    --output text \
    > .env

chmod 600 .env

aws ecr get-login-password --region eu-west-3 \
| docker login \
    --username AWS \
    --password-stdin 796973519136.dkr.ecr.eu-west-3.amazonaws.com

docker compose pull

docker compose up -d --force-recreate --remove-orphans

docker image prune -f