from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from apps.media.models import PodcastEpisode
from apps.resources.models import Resource

pytestmark = pytest.mark.django_db


def test_presign_upload_not_supported_on_local_storage(api, mentor):
    """Test/dev settings use FileSystemStorage, so the endpoint should say so
    rather than pretend to hand back a working S3 upload target."""
    resp = api(mentor).post(
        "/api/resources/presign-upload/",
        {"filename": "notes.pdf", "contentType": "application/pdf"},
        format="json",
    )
    assert resp.status_code == 501
    assert resp.data["code"] == "direct_upload_not_supported"


def test_presign_upload_requires_mentor(api, mentee):
    resp = api(mentee).post(
        "/api/resources/presign-upload/",
        {"filename": "notes.pdf", "contentType": "application/pdf"},
        format="json",
    )
    assert resp.status_code == 403


def test_presign_upload_returns_post_fields_when_s3_configured(api, mentor, monkeypatch: pytest.MonkeyPatch):
    fake_s3 = MagicMock()
    fake_s3.__class__.__name__ = "S3Storage"
    fake_s3.bucket_name = "phronesis-media"
    fake_s3._clean_name = lambda name: name
    fake_s3._normalize_name = lambda name: f"media/{name}"
    fake_client = MagicMock()
    fake_client.generate_presigned_post.return_value = {
        "url": "https://phronesis-media.s3.amazonaws.com/",
        "fields": {"key": "media/resources/uploads/abc.pdf", "policy": "xyz"},
    }
    fake_s3.connection.meta.client = fake_client

    monkeypatch.setattr("apps.common.storage.default_storage", fake_s3)
    resp = api(mentor).post(
        "/api/resources/presign-upload/",
        {"filename": "notes.pdf", "contentType": "application/pdf"},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["key"].startswith("resources/uploads/") and resp.data["key"].endswith(".pdf")
    assert resp.data["url"] == "https://phronesis-media.s3.amazonaws.com/"
    assert resp.data["fields"]["policy"] == "xyz"
    fake_client.generate_presigned_post.assert_called_once()


def test_episode_presign_upload_not_supported_on_local_storage(api, mentor):
    resp = api(mentor).post(
        "/api/episodes/presign-upload/",
        {"filename": "sermon.mp3", "contentType": "audio/mpeg"},
        format="json",
    )
    assert resp.status_code == 501


def test_resource_create_with_file_key_sets_size_from_storage(api, mentor):
    """Simulates the post-upload create call: the file already exists at the
    given storage key (as it would after a real presigned S3 upload), and the
    serializer should adopt it + compute its size from storage."""
    key = "resources/uploads/already-uploaded.txt"
    default_storage.save(key, ContentFile(b"hello world resource contents"))

    resp = api(mentor).post(
        "/api/resources/",
        {"title": "Uploaded via S3", "type": "pdf_guide", "sphere": "finances", "file_key": key},
        format="json",
    )
    assert resp.status_code == 201, resp.data
    resource = Resource.objects.get(pk=resp.data["id"])
    assert resource.file.name == key
    assert resource.file_size_bytes == len(b"hello world resource contents")


def test_resource_multipart_create_parses_json_string_array_fields(api, mentor):
    """The frontend's local-dev fallback (no S3) posts multipart form data,
    where array fields necessarily arrive as JSON-encoded strings."""
    from django.core.files.uploadedfile import SimpleUploadedFile

    resp = api(mentor).post(
        "/api/resources/",
        {
            "title": "Multipart Upload",
            "type": "pdf_guide",
            "sphere": "finances",
            "syllabus_chapters": '["Module 1", "Module 2"]',
            "key_scripture_anchors": '["Proverbs 4:7"]',
            "file": SimpleUploadedFile("notes.txt", b"study notes"),
        },
        format="multipart",
    )
    assert resp.status_code == 201, resp.data
    assert resp.data["syllabus_chapters"] == ["Module 1", "Module 2"]
    assert resp.data["key_scripture_anchors"] == ["Proverbs 4:7"]

    resource = Resource.objects.get(pk=resp.data["id"])
    assert resource.file.read() == b"study notes"


def test_episode_create_with_media_file_key(api, mentor):
    key = "media/episodes/uploads/already-uploaded.mp3"
    default_storage.save(key, ContentFile(b"fake audio bytes"))

    resp = api(mentor).post(
        "/api/episodes/",
        {
            "title": "Uploaded Episode", "media_type": "audio", "sphere": "personal_growth",
            "media_file_key": key,
        },
        format="json",
    )
    assert resp.status_code == 201, resp.data
    episode = PodcastEpisode.objects.get(pk=resp.data["id"])
    assert episode.media_file.name == key
