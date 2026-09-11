from __future__ import annotations

import pytest

from apps.sessions.models import DiscipleshipSession

pytestmark = pytest.mark.django_db


def _session(mentee, mentor, soon):
    return DiscipleshipSession.objects.create(
        mentee=mentee, mentor=mentor, scheduled_at=soon,
        sphere_focus="personal_growth", topic="Check-in",
    )


def test_generate_meet_link_requires_participant(api, mentee, mentor, other_mentor, pairing, soon):
    session = _session(mentee, mentor, soon)
    resp = api(other_mentor).post(f"/api/sessions/{session.id}/generate-meet-link/")
    # get_queryset() already scopes sessions to participants/admin, so a
    # non-participant sees a 404 (no leaked existence) rather than 403.
    assert resp.status_code == 404


def test_generate_meet_link_requires_workspace_connection(api, mentee, mentor, pairing, soon):
    session = _session(mentee, mentor, soon)
    resp = api(mentee).post(f"/api/sessions/{session.id}/generate-meet-link/")
    assert resp.status_code == 409
    assert resp.data["code"] == "not_connected"


def test_generate_meet_link_success(api, mentee, mentor, pairing, soon, monkeypatch: pytest.MonkeyPatch):
    session = _session(mentee, mentor, soon)

    class FakeEventsResource:
        def insert(self, **kwargs):
            class Exec:
                def execute(self_inner):
                    return {
                        "id": "evt-session-1",
                        "conferenceData": {
                            "entryPoints": [{"entryPointType": "video", "uri": "https://meet.google.com/abc-defg-hij"}]
                        },
                    }
            return Exec()

    class FakeService:
        def events(self):
            return FakeEventsResource()

    monkeypatch.setattr("apps.sessions.views.google_client.calendar_service", lambda user: FakeService())

    resp = api(mentee).post(f"/api/sessions/{session.id}/generate-meet-link/")
    assert resp.status_code == 201, resp.data
    assert resp.data["meet_url"] == "https://meet.google.com/abc-defg-hij"
    assert resp.data["meeting_link"] == "https://meet.google.com/abc-defg-hij"
    assert resp.data["google_calendar_event_id"] == "evt-session-1"

    session.refresh_from_db()
    assert session.meet_url == "https://meet.google.com/abc-defg-hij"


def test_generate_meet_link_is_idempotent(api, mentee, mentor, pairing, soon, monkeypatch: pytest.MonkeyPatch):
    session = _session(mentee, mentor, soon)
    session.meet_url = "https://meet.google.com/existing-link"
    session.save(update_fields=["meet_url"])

    call_count = {"n": 0}

    def fail_if_called(user):
        call_count["n"] += 1
        raise AssertionError("should not call Google when a link already exists")

    monkeypatch.setattr("apps.sessions.views.google_client.calendar_service", fail_if_called)

    resp = api(mentee).post(f"/api/sessions/{session.id}/generate-meet-link/")
    assert resp.status_code == 200
    assert resp.data["meet_url"] == "https://meet.google.com/existing-link"
    assert call_count["n"] == 0
