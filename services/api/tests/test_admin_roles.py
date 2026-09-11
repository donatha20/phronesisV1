from __future__ import annotations

import pytest

from apps.accounts.models import Role
from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db


# ---- RoleViewSet ----------------------------------------------------
def test_non_admin_cannot_list_roles(api, mentee, mentor):
    assert api(mentee).get("/api/admin/roles/").status_code == 403
    assert api(mentor).get("/api/admin/roles/").status_code == 403


def test_admin_can_list_and_create_roles(api, admin_user):
    client = api(admin_user)
    listed = client.get("/api/admin/roles/")
    assert listed.status_code == 200
    slugs = {r["slug"] for r in listed.data["results"]} if "results" in listed.data else {
        r["slug"] for r in listed.data
    }
    assert {"mentee", "mentor", "admin"} <= slugs

    created = client.post(
        "/api/admin/roles/",
        {"name": "Youth Pastor", "slug": "youth-pastor", "base_kind": "mentor", "description": "Youth ministry lead"},
        format="json",
    )
    assert created.status_code == 201, created.data
    assert created.data["is_system"] is False


def test_admin_cannot_delete_or_rename_system_role(api, admin_user):
    client = api(admin_user)
    mentee_role = Role.objects.get(slug="mentee")

    deleted = client.delete(f"/api/admin/roles/{mentee_role.id}/")
    assert deleted.status_code == 403

    renamed = client.patch(f"/api/admin/roles/{mentee_role.id}/", {"slug": "renamed"}, format="json")
    assert renamed.status_code == 400

    kind_changed = client.patch(f"/api/admin/roles/{mentee_role.id}/", {"base_kind": "admin"}, format="json")
    assert kind_changed.status_code == 400


def test_admin_can_delete_custom_role(api, admin_user):
    role = Role.objects.create(name="Temp Role", slug="temp-role", base_kind="mentee")
    resp = api(admin_user).delete(f"/api/admin/roles/{role.id}/")
    assert resp.status_code == 204
    assert not Role.objects.filter(slug="temp-role").exists()


# ---- AdminUserViewSet + role assignment -----------------------------
def test_non_admin_cannot_list_users(api, mentee):
    assert api(mentee).get("/api/admin/users/").status_code == 403


def test_admin_can_list_users(api, admin_user, mentee, mentor):
    resp = api(admin_user).get("/api/admin/users/")
    assert resp.status_code == 200


def test_admin_assigns_role_and_it_is_audited(api, admin_user, mentee):
    youth_pastor = Role.objects.create(name="Youth Pastor", slug="youth-pastor", base_kind="mentor")

    resp = api(admin_user).patch(
        f"/api/admin/users/{mentee.id}/role/", {"role_id": str(youth_pastor.id)}, format="json"
    )
    assert resp.status_code == 200, resp.data
    assert resp.data["role"]["slug"] == "youth-pastor"

    mentee.refresh_from_db()
    assert mentee.role_id == youth_pastor.id
    audit_row = AuditLog.objects.filter(action="account.role_change", target_id=str(mentee.id)).first()
    assert audit_row is not None
    assert audit_row.actor_id == admin_user.id
    assert audit_row.metadata["old_role"] == "mentee"
    assert audit_row.metadata["new_role"] == "youth-pastor"


def test_assigning_same_role_does_not_duplicate_audit_row(api, admin_user, mentee):
    mentee_role = Role.objects.get(slug="mentee")
    before = AuditLog.objects.filter(action="account.role_change").count()

    resp = api(admin_user).patch(
        f"/api/admin/users/{mentee.id}/role/", {"role_id": str(mentee_role.id)}, format="json"
    )
    assert resp.status_code == 200
    after = AuditLog.objects.filter(action="account.role_change").count()
    assert after == before


def test_non_admin_cannot_assign_role(api, mentor, mentee):
    admin_role_id = Role.objects.get(slug="admin").id
    resp = api(mentor).patch(f"/api/admin/users/{mentee.id}/role/", {"role_id": str(admin_role_id)}, format="json")
    assert resp.status_code == 403


def test_assign_role_rejects_bad_id(api, admin_user, mentee):
    resp = api(admin_user).patch(f"/api/admin/users/{mentee.id}/role/", {"role_id": "not-a-uuid"}, format="json")
    assert resp.status_code == 400
