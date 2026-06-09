data "aws_ami" "amazon_linux" {
  most_recent = true

  owners = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

resource "aws_instance" "web" {
  ami = data.aws_ami.amazon_linux.id

  instance_type = "t3.micro"

  user_data = templatefile(
    "${path.module}/templates/user_data.sh.tpl",
    {}
  )
}
