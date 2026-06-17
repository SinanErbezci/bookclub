data "aws_ami" "amazon_linux_2023" {
  most_recent = true

  owners = ["137112412989"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "web" {
  ami           = var.base_ami # you can use data source 
  instance_type = "t3.micro"


  subnet_id                   = aws_subnet.private_a.id
  associate_public_ip_address = false

  vpc_security_group_ids = [aws_security_group.ec2.id]

  iam_instance_profile = aws_iam_instance_profile.ec2.name


  user_data = templatefile(
    "${path.module}/templates/user_data.sh.tpl",
    {}
  )

  user_data_replace_on_change = true

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  ebs_optimized = true

  tags = merge(local.common_tags, {
    Name = "bookclub-prod"
  })

  root_block_device {
    volume_type = "gp3"
    volume_size = 8
      delete_on_termination = true

    tags = merge(local.common_tags, {
      Name = "bookclub-root"
    })
  }
}