resource "cloudflare_dns_record" "api" {
  zone_id = var.cloudflare_zone_id

  name    = "api.sinanerbezci.com"
  type    = "CNAME"
  content = aws_lb.bookclub[0].dns_name

  ttl     = 300
  proxied = false
}