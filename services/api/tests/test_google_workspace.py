from __future__ import annotations

import pytest

from apps.audit.models import AuditLog
from apps.integrations.google_oauth import WorkspaceGrant
from apps.integrations.models import GoogleWorkspaceToken

pytestmark = pytest.mark.django_db

FRONTEND = "http://localhost:3000"


def test_status_not_connected(api, mentee):
    resp = api(mentee).get("/api/integrations/google/status/")
    assert resp.status_code == 200
    assert resp.data["connected"] is False


def test_authorize_requires_auth():
    from rest_framework.test import APIClient

    resp = APIClient().get("/api/integrations/google/authorize/")
    assert resp.status_code in (401, 403)


def test_authorize_redirects_and_sets_state(api, mentee, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "apps.integrations.views.build_authorization_url",
        lambda: ("https://accounts.google.com/o/oauth2/v2/auth?x=1", "state-abc"),
    )
    resp = api(mentee).get("/api/integrations/google/authorize/")
    assert resp.status_code == 302
    assert resp.cookies["g_workspace_oauth_state"].value == "state-abc"
    assert resp.cookies["g_workspace_oauth_uid"].value == str(mentee.pk)


def test_callback_stores_encrypted_token_and_audits(api, mentee, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(
        "apps.integrations.views.exchange_code_for_grant",
        lambda **kw: WorkspaceGrant(
            email="mentee@example.com", refresh_token="refresh-xyz",
            access_token="access-xyz", scopes=["drive.file"], expiry=None,
        ),
    )
    client = api(mentee)
    client.cookies["g_workspace_oauth_state"] = "s1"
    client.cookies["g_workspace_oauth_uid"] = str(mentee.pk)
    resp = client.get("/api/integrations/google/callback", {"code": "c", "state": "s1"})
    assert resp.status_code == 302
    assert resp["Location"] == f"{FRONTEND}/?google_connected=1"

    token = GoogleWorkspaceToken.objects.get(user=mentee)
    assert token.encrypted_refresh_token == "refresh-xyz"  # transparently decrypted
    assert token.revoked_at is None
    assert AuditLog.objects.filter(action="integration.google_connect", actor=mentee).exists()

    status_resp = client.get("/api/integrations/google/status/")
    assert status_resp.data["connected"] is True
    assert status_resp.data["google_account_email"] == "mentee@example.com"


def test_callback_state_mismatch(api, mentee):
    client = api(mentee)
    client.cookies["g_workspace_oauth_state"] = "real"
    resp = client.get("/api/integrations/google/callback", {"code": "c", "state": "forged"})
    assert resp.status_code == 302
    assert "google_error=state_mismatch" in resp["Location"]


def test_disconnect_marks_revoked_and_audits(api, mentee, monkeypatch: pytest.MonkeyPatch):
    GoogleWorkspaceToken.objects.create(
        user=mentee, encrypted_refresh_token="refresh-1", google_account_email="mentee@example.com"
    )
    monkeypatch.setattr("apps.integrations.views.revoke_refresh_token", lambda token: None)
    resp = api(mentee).post("/api/integrations/google/disconnect/")
    assert resp.status_code == 204
    token = GoogleWorkspaceToken.objects.get(user=mentee)
    assert token.revoked_at is not None
    assert AuditLog.objects.filter(action="integration.google_disconnect", actor=mentee).exists()


def test_drive_files_requires_connection(api, mentee):
    resp = api(mentee).get("/api/integrations/google/drive/files/")
    assert resp.status_code == 409
    assert resp.data["code"] == "not_connected"


def test_drive_files_proxies_to_google(api, mentee, monkeypatch: pytest.MonkeyPatch):
    GoogleWorkspaceToken.objects.create(user=mentee, encrypted_refresh_token="refresh-1")

    class FakeFilesResource:
        def list(self, **kwargs):
            class Exec:
                def execute(self_inner):
                    return {"files": [{"id": "f1", "name": "Notes.txt", "mimeType": "text/plain"}]}

            return Exec()

    class FakeService:
        def files(self):
            return FakeFilesResource()

    monkeypatch.setattr("apps.integrations.google_client.drive_service", lambda user: FakeService())
    resp = api(mentee).get("/api/integrations/google/drive/files/")
    assert resp.status_code == 200
    assert resp.data["files"][0]["name"] == "Notes.txt"


def test_calendar_create_event_with_meet(api, mentee, monkeypatch: pytest.MonkeyPatch):
    GoogleWorkspaceToken.objects.create(user=mentee, encrypted_refresh_token="refresh-1")

    class FakeEventsResource:
        def insert(self, **kwargs):
            class Exec:
                def execute(self_inner):
                    return {
                        "id": "evt1",
                        "conferenceData": {"entryPoints": [{"entryPointType": "video", "uri": "https://meet.google.com/xyz"}]},
                    }

            return Exec()

    class FakeService:
        def events(self):
            return FakeEventsResource()

    monkeypatch.setattr("apps.integrations.google_client.calendar_service", lambda user: FakeService())
    resp = api(mentee).post(
        "/api/integrations/google/calendar/events/",
        {
            "summary": "Discipleship Session",
            "start": {"dateTime": "2026-09-20T19:00:00Z"},
            "end": {"dateTime": "2026-09-20T19:45:00Z"},
            "includeGoogleMeet": True,
        },
        format="json",
    )
    assert resp.status_code == 201
    assert resp.data["id"] == "evt1"


def test_instant_meet_returns_meet_link(api, mentee, monkeypatch: pytest.MonkeyPatch):
    GoogleWorkspaceToken.objects.create(user=mentee, encrypted_refresh_token="refresh-1")

    class FakeEventsResource:
        def insert(self, **kwargs):
            class Exec:
                def execute(self_inner):
                    return {
                        "id": "evt2",
                        "conferenceData": {"entryPoints": [{"entryPointType": "video", "uri": "https://meet.google.com/abc"}]},
                    }

            return Exec()

    class FakeService:
        def events(self):
            return FakeEventsResource()

    monkeypatch.setattr("apps.integrations.google_client.calendar_service", lambda user: FakeService())
    resp = api(mentee).post("/api/integrations/google/meet/instant/", {}, format="json")
    assert resp.status_code == 201
    assert resp.data["meetLink"] == "https://meet.google.com/abc"
