#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

aws ssm put-parameter \
  --name "/bookclub/production/env" \
  --type SecureString \
  --overwrite \
  --value "file://${ROOT_DIR}/bookslub/.env"

echo "Uploaded .env to Parameter Store."