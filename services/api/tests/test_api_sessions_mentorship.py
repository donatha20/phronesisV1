from __future__ import annotations

import pytest

from apps.mentorship.models import Mentorship

pytestmark = pytest.mark.django_db


def test_session_requires_pairing_and_stores_real_datetime(api, mentee, mentor, other_mentor, pairing, soon):
    payload = {
        "mentee": str(mentee.id), "mentor": str(mentor.id),
        "scheduled_at": soon, "duration_minutes": 45,
        "sphere_focus": "personal_growth", "topic": "Check-in",
    }
    ok = api(mentee).post("/api/sessions/", payload, format="json")
    assert ok.status_code == 201, ok.data
    assert ok.data["scheduled_at"].startswith(soon[:16])
    assert ok.data["status"] == "scheduled"

    bad = api(mentee).post(
        "/api/sessions/", {**payload, "mentor": str(other_mentor.id)}, format="json"
    )
    assert bad.status_code == 400


def test_cancel_and_complete_actions(api, mentee, mentor, pairing, soon):
    sid = api(mentor).post(
        "/api/sessions/",
        {"mentee": str(mentee.id), "mentor": str(mentor.id), "scheduled_at": soon,
         "sphere_focus": "relationships", "topic": "Prep"},
        format="json",
    ).data["id"]

    done = api(mentor).post(f"/api/sessions/{sid}/complete/", {"meeting_notes": "Good talk"}, format="json")
    assert done.data["status"] == "completed"
    assert done.data["meeting_notes"] == "Good talk"


def test_application_accept_creates_pairing_and_bumps_count(api, other_mentee, mentor):
    app_resp = api(other_mentee).post(
        "/api/mentorship-applications/",
        {"mentor": str(mentor.id), "chosen_sphere": "finances",
         "personal_introduction": "Hi", "growth_desire": "Grow", "meeting_frequency": "Weekly"},
        format="json",
    )
    assert app_resp.status_code == 201, app_resp.data
    app_id = app_resp.data["id"]

    accepted = api(mentor).post(f"/api/mentorship-applications/{app_id}/accept/")
    assert accepted.status_code == 201, accepted.data
    assert Mentorship.objects.filter(mentee=other_mentee, mentor=mentor, is_active=True).exists()
    mentor.refresh_from_db()
    assert mentor.active_mentees_count == 1


def test_second_active_mentor_rejected(api, mentee, mentor, other_mentor, pairing):
    app_id = api(mentee).post(
        "/api/mentorship-applications/",
        {"mentor": str(other_mentor.id), "chosen_sphere": "finances",
         "personal_introduction": "x", "growth_desire": "y", "meeting_frequency": "Weekly"},
        format="json",
    ).data["id"]
    resp = api(other_mentor).post(f"/api/mentorship-applications/{app_id}/accept/")
    assert resp.status_code == 400
    assert "active mentor" in str(resp.data).lower()
