from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db


def test_healthz() -> None:
    resp = APIClient().get("/api/healthz/")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_user_model_is_email_first() -> None:
    User = get_user_model()
    user = User.objects.create_user(email="grace@example.com", password="a-strong-pass-1")
    assert user.role == "mentee"
    assert user.avatar_initial == "G"
    assert user.get_username() == "grace@example.com"


def test_registration_then_me_flow() -> None:
    client = APIClient()
    reg = client.post(
        "/api/auth/registration/",
        {
            "email": "newbeliever@example.com",
            "password1": "a-strong-pass-1",
            "password2": "a-strong-pass-1",
            "first_name": "Sam",
        },
        format="json",
    )
    assert reg.status_code in (201, 204), reg.content

    login = client.post(
        "/api/auth/login/",
        {"email": "newbeliever@example.com", "password": "a-strong-pass-1"},
        format="json",
    )
    assert login.status_code == 200, login.content

    me = client.get("/api/auth/user/")
    assert me.status_code == 200
    assert me.json()["email"] == "newbeliever@example.com"
    assert me.json()["role"] == "mentee"


def test_login_writes_audit_row() -> None:
    from apps.audit.models import AuditLog

    User = get_user_model()
    User.objects.create_user(email="mentor@example.com", password="a-strong-pass-1")
    APIClient().post(
        "/api/auth/login/",
        {"email": "mentor@example.com", "password": "a-strong-pass-1"},
        format="json",
    )
    assert AuditLog.objects.filter(action="auth.login", actor_email="mentor@example.com").exists()
