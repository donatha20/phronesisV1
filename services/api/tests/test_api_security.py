from __future__ import annotations

import pytest

from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db


def test_get_and_patch_my_security_settings(api, mentee):
    client = api(mentee)
    got = client.get("/api/auth/security/")
    assert got.status_code == 200
    assert got.data["two_factor_enabled"] is False

    patched = client.patch("/api/auth/security/", {"two_factor_enabled": True}, format="json")
    assert patched.status_code == 200
    assert patched.data["two_factor_enabled"] is True


def test_password_change_updates_settings_and_audits(api, mentee):
    client = api(mentee)
    resp = client.post(
        "/api/auth/password/change/",
        {"old_password": "a-strong-pass-1", "new_password1": "a-new-pass-2", "new_password2": "a-new-pass-2"},
        format="json",
    )
    assert resp.status_code == 200, resp.data
    ss = client.get("/api/auth/security/")
    assert ss.data["last_password_change_at"] is not None
    assert AuditLog.objects.filter(action="auth.password_change", actor=mentee).exists()


def test_mentor_directory_lists_only_mentors(api, mentee, mentor, other_mentee):
    resp = api(mentee).get("/api/mentors/")
    emails = [m["email"] for m in resp.data["results"]]
    assert mentor.email in emails
    assert mentee.email not in emails
    assert other_mentee.email not in emails
