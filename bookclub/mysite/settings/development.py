from .base import *
import dj_database_url
from datetime import timedelta

DEBUG = True

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "0.0.0.0"
]

CORS_ALLOW_ALL_ORIGINS = True

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

DATABASES = {
    "default": dj_database_url.parse(
        os.environ["DEV_DATABASE_URL"]
    )
}

SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"] = {
    "anon": "10000/day",
    "user": "100000/day",
}

REDIS_URL = "redis://localhost:6379/0"

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL

CELERY_BEAT_SCHEDULE = {
    "refresh-random-homepage": {
        "task": "library.tasks.refresh_random_homepage",
        "schedule": timedelta(minutes=5),
    },
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    },
}