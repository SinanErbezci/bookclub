```bash
#!/bin/bash

set -euo pipefail

echo "======================================"
echo "Starting BookClub deployment..."
echo "======================================"

cd /home/ec2-user/bookclub/bookclub

echo "Logging into Amazon ECR..."

aws ecr get-login-password --region eu-west-3 \
| docker login \
    --username AWS \
    --password-stdin 796973519136.dkr.ecr.eu-west-3.amazonaws.com

echo "Pulling latest images..."

docker compose pull

echo "Recreating containers..."

docker compose up -d --force-recreate

echo "Removing unused Docker images..."

docker image prune -f

echo "======================================"
echo "Deployment completed successfully!"
echo "======================================"
```
