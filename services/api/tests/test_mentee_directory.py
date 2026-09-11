from __future__ import annotations

import pytest

from apps.mentorship.models import Mentorship

pytestmark = pytest.mark.django_db


def test_mentee_sees_nothing(api, mentee, other_mentee):
    resp = api(mentee).get("/api/mentees/")
    assert resp.status_code == 200
    rows = resp.data["results"] if "results" in resp.data else resp.data
    assert rows == []


def test_mentor_sees_only_own_active_mentees(api, mentor, mentee, other_mentee, other_mentor):
    Mentorship.objects.create(mentor=mentor, mentee=mentee, is_active=True)
    Mentorship.objects.create(mentor=other_mentor, mentee=other_mentee, is_active=True)

    resp = api(mentor).get("/api/mentees/")
    rows = resp.data["results"] if "results" in resp.data else resp.data
    ids = {r["id"] for r in rows}
    assert ids == {str(mentee.id)}


def test_ended_pairing_removes_mentee_from_directory(api, mentor, mentee):
    pairing = Mentorship.objects.create(mentor=mentor, mentee=mentee, is_active=True)
    pairing.is_active = False
    pairing.save(update_fields=["is_active"])

    resp = api(mentor).get("/api/mentees/")
    rows = resp.data["results"] if "results" in resp.data else resp.data
    assert rows == []


def test_admin_sees_all_mentees(api, admin_user, mentee, other_mentee):
    resp = api(admin_user).get("/api/mentees/")
    rows = resp.data["results"] if "results" in resp.data else resp.data
    ids = {r["id"] for r in rows}
    assert ids == {str(mentee.id), str(other_mentee.id)}
