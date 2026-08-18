resource "aws_eip" "nat" {
  count  = var.production_enabled ? 1 : 0
  domain = "vpc"

  tags = merge(local.common_tags, {
    Name = "bookclub-nat-eip"
  })
}

resource "aws_nat_gateway" "main" {
  count = var.production_enabled ? 1 : 0

  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public_a.id

  depends_on = [aws_internet_gateway.main]

  tags = merge(local.common_tags, {
    Name = "bookclub-nat"
  })
}

resource "aws_route" "private_nat" {
  count = var.production_enabled ? 1 : 0

  route_table_id         = aws_route_table.private.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[0].id
}