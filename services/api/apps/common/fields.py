"""Symmetric field-level encryption for secrets at rest (e.g. Google refresh tokens).

Uses Fernet (AES-128-CBC + HMAC). The key comes from ``settings.FIELD_ENCRYPTION_KEY``
which in production is injected from AWS Secrets Manager. Generate one with::

    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
"""
from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import models
from django.utils.functional import cached_property


class EncryptedTextField(models.TextField):
    """A TextField whose value is transparently encrypted in the database."""

    description = "Text stored encrypted at rest (Fernet)"

    @cached_property
    def _fernet(self):  # type: ignore[no-untyped-def]
        from cryptography.fernet import Fernet

        key = getattr(settings, "FIELD_ENCRYPTION_KEY", "") or ""
        if not key:
            raise ImproperlyConfigured(
                "FIELD_ENCRYPTION_KEY must be set to use EncryptedTextField."
            )
        return Fernet(key.encode() if isinstance(key, str) else key)

    def get_prep_value(self, value):  # type: ignore[no-untyped-def]
        if value is None:
            return value
        return self._fernet.encrypt(str(value).encode()).decode()

    def from_db_value(self, value, expression, connection):  # type: ignore[no-untyped-def]
        if value is None:
            return value
        try:
            return self._fernet.decrypt(value.encode()).decode()
        except Exception:  # pragma: no cover - corrupt/rotated key
            return None

    def to_python(self, value):  # type: ignore[no-untyped-def]
        return value
