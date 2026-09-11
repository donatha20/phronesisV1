"""Direct-to-S3 uploads for large media (episode audio/video, resource files).

In production ``default_storage`` is ``storages.backends.s3.S3Storage`` (see
``config/settings/prod.py``), so we generate a presigned POST and the browser
uploads straight to S3 — the file never transits the Django app server.
Downloads are already presigned automatically: ``AWS_QUERYSTRING_AUTH = True``
makes every ``FileField.url`` a time-limited signed GET.

In local/test dev, ``default_storage`` is the filesystem — there's no bucket
to presign against, so callers should fall back to a plain multipart POST to
the model's create/update endpoint (which works against any storage backend).
"""
from __future__ import annotations

import uuid

from django.core.files.storage import default_storage

MAX_UPLOAD_BYTES = 1024 * 1024 * 1024  # 1 GiB


class DirectUploadNotSupported(Exception):
    """Raised when ``default_storage`` isn't S3-backed (local/test dev)."""


def is_s3_backend() -> bool:
    return default_storage.__class__.__name__ in ("S3Storage", "S3Boto3Storage")


def generate_presigned_post(*, key_prefix: str, filename: str, content_type: str) -> dict:
    """Returns ``{"url", "fields", "key"}``.

    ``key`` is the storage-relative name to send back on create/update (e.g.
    ``resources/uploads/<uuid>.pdf``) — it excludes the storage ``location``
    prefix ("media/"), matching what ``FileField.name`` normally holds so
    ``.url``/``.size`` keep working unchanged after the model is saved.
    """
    if not is_s3_backend():
        raise DirectUploadNotSupported("S3 storage is not configured in this environment.")

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    key = f"{key_prefix.strip('/')}/{uuid.uuid4().hex}.{ext}"
    full_key = default_storage._normalize_name(default_storage._clean_name(key))  # type: ignore[attr-defined]

    client = default_storage.connection.meta.client
    presigned = client.generate_presigned_post(
        Bucket=default_storage.bucket_name,
        Key=full_key,
        Fields={"Content-Type": content_type},
        Conditions=[
            {"Content-Type": content_type},
            ["content-length-range", 1, MAX_UPLOAD_BYTES],
        ],
        ExpiresIn=600,
    )
    return {"url": presigned["url"], "fields": presigned["fields"], "key": key}
