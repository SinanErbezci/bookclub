from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
]

CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False