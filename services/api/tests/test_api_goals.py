from __future__ import annotations

import pytest

from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db


def _create_goal(client, **over):
    payload = {
        "sphere": "personal_growth",
        "title": "Daily Scripture rhythm",
        "description": "Read John before work.",
        "milestones": [{"title": "Pick a time"}, {"title": "Finish John 1-7"}],
        **over,
    }
    return client.post("/api/goals/", payload, format="json")


def test_mentee_creates_goal_assigned_to_self_and_audited(api, mentee):
    resp = _create_goal(api(mentee))
    assert resp.status_code == 201, resp.data
    assert str(resp.data["assigned_to"]) == str(mentee.id)
    assert str(resp.data["created_by"]) == str(mentee.id)
    assert resp.data["progress_percent"] == 0
    assert AuditLog.objects.filter(action="record.create", target_type="goals.goal").exists()


def test_goal_not_visible_to_unrelated_mentee(api, mentee, other_mentee):
    gid = _create_goal(api(mentee)).data["id"]
    assert api(other_mentee).get(f"/api/goals/{gid}/").status_code == 404


def test_paired_mentor_sees_and_approves_mentee_goal(api, mentee, mentor, pairing):
    gid = _create_goal(api(mentee)).data["id"]
    mentor_client = api(mentor)
    assert mentor_client.get(f"/api/goals/{gid}/").status_code == 200
    resp = mentor_client.patch(f"/api/goals/{gid}/", {"mentor_approved": True, "mentor_feedback": "Great start"}, format="json")
    assert resp.status_code == 200, resp.data
    assert resp.data["mentor_approved"] is True


def test_unrelated_mentor_cannot_see_goal(api, mentee, other_mentor):
    gid = _create_goal(api(mentee)).data["id"]
    assert api(other_mentor).get(f"/api/goals/{gid}/").status_code == 404


def test_milestone_toggle_recomputes_progress(api, mentee):
    resp = _create_goal(api(mentee))
    gid = resp.data["id"]
    milestone_id = resp.data["milestones"][0]["id"]
    out = api(mentee).patch(
        f"/api/goals/{gid}/milestones/{milestone_id}/", {"is_completed": True}, format="json"
    )
    assert out.status_code == 200
    assert out.data["progress_percent"] == 50
