from .base import *
import os 

DEBUG = False

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,sinanbook.club,www.sinanbook.club"
    ).split(",")
    if host.strip()
]
# For ALB health checks. Adding ec2 private ip
#try:
#    _, _, ips = socket.gethostbyname_ex(socket.gethostname())
#    ALLOWED_HOSTS.extend(ips)
#except Exception:
#    pass

CORS_ALLOW_ALL_ORIGINS = False

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://sinanbook.club",
    "https://www.sinanbook.club",
]

CSRF_TRUSTED_ORIGINS = [
    "https://sinanbook.club",
    "https://www.sinanbook.club",
]

SESSION_COOKIE_SAMESITE = "None"
CSRF_COOKIE_SAMESITE = "None"

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

SECURE_SSL_REDIRECT = True

SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

X_FRAME_OPTIONS = "DENY"

SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_REDIRECT_EXEMPT = [r"^health/$"]