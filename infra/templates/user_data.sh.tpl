#!/bin/bash

dnf update -y

dnf install -y docker git

systemctl enable docker
systemctl start docker

usermod -aG docker ec2-user

mkdir -p /opt/bookclub
mkdir -p /opt/bookclub/nginx

chown -R ec2-user:ec2-user /opt/bookclub