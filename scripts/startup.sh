#!/bin/bash

set -euo pipefail

terraform -chdir=infra apply -auto-approve

echo
echo "Infrastructure recreated."
echo "Deploy the latest application with:"
echo
echo "git push origin main"