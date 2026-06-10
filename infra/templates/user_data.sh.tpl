#!/bin/bash
set -euxo pipefail

exec > >(tee /var/log/user-data.log)
exec 2>&1

dnf install -y docker

systemctl enable docker
systemctl start docker

until docker info >/dev/null 2>&1; do
  sleep 1
done

# Install Docker Compose plugin

mkdir -p /usr/libexec/docker/cli-plugins

curl -fsSL \
  "https://github.com/docker/compose/releases/download/v2.39.1/docker-compose-linux-$(uname -m)" \
  -o /usr/libexec/docker/cli-plugins/docker-compose

chmod +x /usr/libexec/docker/cli-plugins/docker-compose

test -x /usr/libexec/docker/cli-plugins/docker-compose

usermod -aG docker ec2-user

mkdir -p /opt/bookclub/nginx
chown -R ec2-user:ec2-user /opt/bookclub
chmod 755 /opt/bookclub

docker --version
docker compose version
aws --version

echo "EC2 bootstrap complete"