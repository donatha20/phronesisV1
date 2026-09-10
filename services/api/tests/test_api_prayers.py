from __future__ import annotations

import pytest

from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db

MASKED = "••• Hidden — unlock the vault to view •••"


def _new_prayer(client, privacy="private_vault", need="Please pray about the internship decision."):
    return client.post(
        "/api/prayers/",
        {"title": "Guidance", "prayer_need": need, "category_sphere": "academia_career",
         "privacy_level": privacy},
        format="json",
    )


def test_private_vault_body_masked_until_unlock(api, mentee):
    client = api(mentee)
    pid = _new_prayer(client).data["id"]

    hidden = client.get(f"/api/prayers/{pid}/")
    assert hidden.data["is_body_hidden"] is True
    assert hidden.data["prayer_need"] == MASKED

    unlocked = client.post("/api/prayers/vault/unlock/", {"password": "a-strong-pass-1"}, format="json")
    assert unlocked.status_code == 200 and unlocked.data["unlocked"] is True

    shown = client.get(f"/api/prayers/{pid}/")
    assert shown.data["is_body_hidden"] is False
    assert "internship" in shown.data["prayer_need"]
    assert AuditLog.objects.filter(action="prayer.vault_unlock", actor=mentee).exists()
    assert AuditLog.objects.filter(action="prayer.view").exists()


def test_vault_unlock_wrong_password_audited_and_rejected(api, mentee):
    resp = api(mentee).post("/api/prayers/vault/unlock/", {"password": "nope"}, format="json")
    assert resp.status_code == 400
    assert AuditLog.objects.filter(action="prayer.vault_unlock_failed").exists()


def test_mentor_only_visible_to_paired_mentor_not_stranger(api, mentee, mentor, other_mentor, pairing):
    pid = _new_prayer(api(mentee), privacy="mentor_only").data["id"]
    assert api(mentor).get(f"/api/prayers/{pid}/").status_code == 200
    assert api(other_mentor).get(f"/api/prayers/{pid}/").status_code == 404


def test_community_prayer_visible_to_all_and_intercede(api, mentee, other_mentee):
    pid = _new_prayer(api(mentee), privacy="community_intercessors").data["id"]
    resp = api(other_mentee).post(f"/api/prayers/{pid}/intercede/")
    assert resp.status_code == 200
    assert resp.data["intercessors_count"] == 1
    assert resp.data["is_prayed_by_me"] is True


def test_cannot_intercede_on_private_vault(api, mentee, other_mentee):
    pid = _new_prayer(api(mentee)).data["id"]
    # not even visible; get_object -> 404
    assert api(other_mentee).post(f"/api/prayers/{pid}/intercede/").status_code == 404
