"""Settings for the isolated Compose test services."""

import os

if os.environ.get("BOOKCLUB_TEST_CONTAINER") != "1":
    raise RuntimeError("Run the backend tests through docker-compose.test.yml.")

os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DJANGO_SECRET_KEY"] = "bookclub-local-tests-only"

from .base import *

ALLOWED_HOSTS = ["testserver", "localhost"]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": "test-db",
        "PORT": "5432",
        "NAME": "bookclub_test_bootstrap",
        "USER": "bookclub_test",
        "PASSWORD": "bookclub_test",
        "TEST": {"NAME": "bookclub_test"},
    },
}
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
CELERY_BROKER_URL = "memory://"
CELERY_RESULT_BACKEND = None
OPENAI_API_KEY = None
OPENAI_MODEL = "gpt-4.1-mini"
AI_SERVICE_URL = "http://127.0.0.1:1"
OBSERVABILITY_TEST_ENDPOINTS = False
