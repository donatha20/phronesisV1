"""Settings used by the pytest suite."""
from __future__ import annotations

from .base import *  # noqa: F401,F403

DEBUG = False
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
CELERY_TASK_ALWAYS_EAGER = True
FIELD_ENCRYPTION_KEY = "dGVzdC1rZXktdGVzdC1rZXktdGVzdC1rZXktMzJieXQ="  # 32 bytes, base64

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
