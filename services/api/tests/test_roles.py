from __future__ import annotations

import pytest

from apps.accounts.models import Role
from apps.common.permissions import is_admin, is_mentor

pytestmark = pytest.mark.django_db


def test_three_system_roles_are_seeded():
    roles = {r.slug: r for r in Role.objects.filter(is_system=True)}
    assert set(roles) == {"mentee", "mentor", "admin"}
    assert roles["mentee"].base_kind == "mentee"
    assert roles["mentor"].base_kind == "mentor"
    assert roles["admin"].base_kind == "admin"


def test_resolve_accepts_slug_string_or_instance():
    mentor_role = Role.objects.get(slug="mentor")
    assert Role.resolve("mentor") == mentor_role
    assert Role.resolve(mentor_role) is mentor_role


def test_make_user_fixture_resolves_role_string(mentee, mentor, admin_user):
    assert mentee.role.slug == "mentee"
    assert mentor.role.slug == "mentor"
    assert admin_user.role.slug == "admin"


def test_custom_role_with_mentor_base_kind_grants_mentor_permissions(make_user):
    youth_pastor = Role.objects.create(
        name="Youth Pastor", slug="youth-pastor", base_kind="mentor",
    )
    user = make_user("pastor@example.com", "mentee")  # placeholder, overwritten below
    user.role = youth_pastor
    user.save(update_fields=["role"])

    assert is_mentor(user) is True
    assert is_admin(user) is False


def test_custom_role_with_admin_base_kind_grants_admin_permissions(make_user):
    ops_lead = Role.objects.create(name="Ops Lead", slug="ops-lead", base_kind="admin")
    user = make_user("opslead@example.com", "mentee")
    user.role = ops_lead
    user.save(update_fields=["role"])

    assert is_admin(user) is True
    assert is_mentor(user) is False


def test_system_role_cannot_be_deleted_via_protect_constraint(mentee):
    mentee_role = Role.objects.get(slug="mentee")
    from django.db.models import ProtectedError

    with pytest.raises(ProtectedError):
        mentee_role.delete()
