from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.test import Client

from apps.accounts.google_oauth import GoogleIdentity
from apps.audit.models import AuditLog

pytestmark = pytest.mark.django_db

FRONTEND = "http://localhost:3000"


def test_csrf_endpoint_sets_cookie() -> None:
    resp = Client().get("/api/auth/csrf/")
    assert resp.status_code == 200
    assert "csrftoken" in resp.cookies


def test_authorize_redirects_to_google_and_sets_state(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "apps.accounts.views.build_authorization_url",
        lambda: ("https://accounts.google.com/o/oauth2/v2/auth?x=1", "state-abc"),
    )
    resp = Client().get("/api/auth/google/authorize/")
    assert resp.status_code == 302
    assert resp["Location"].startswith("https://accounts.google.com/")
    assert resp.cookies["g_oauth_state"].value == "state-abc"
    assert resp.cookies["g_oauth_state"]["httponly"]


def test_callback_creates_user_sets_jwt_and_audits(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        "apps.accounts.views.exchange_code_for_identity",
        lambda **kw: GoogleIdentity(
            email="newgoogle@example.com", email_verified=True,
            given_name="Ada", family_name="Lovelace", sub="g-123",
        ),
    )
    client = Client()
    client.cookies["g_oauth_state"] = "state-xyz"
    resp = client.get("/api/auth/google/callback", {"code": "auth-code", "state": "state-xyz"})

    assert resp.status_code == 302
    assert resp["Location"] == f"{FRONTEND}/auth/callback?status=success&new=1"
    assert "phronesis-access" in resp.cookies and resp.cookies["phronesis-access"].value
    assert "phronesis-refresh" in resp.cookies and resp.cookies["phronesis-refresh"].value

    user = get_user_model().objects.get(email="newgoogle@example.com")
    assert user.role == "mentee"
    assert not user.has_usable_password()
    assert AuditLog.objects.filter(action="auth.register", actor=user).exists()
    assert AuditLog.objects.filter(action="auth.login", actor=user).exists()


def test_callback_existing_user_no_register_audit(monkeypatch: pytest.MonkeyPatch) -> None:
    get_user_model().objects.create_user(email="known@example.com", password="a-strong-pass-1")
    monkeypatch.setattr(
        "apps.accounts.views.exchange_code_for_identity",
        lambda **kw: GoogleIdentity("known@example.com", True, "K", "Nown", "g-9"),
    )
    client = Client()
    client.cookies["g_oauth_state"] = "s1"
    resp = client.get("/api/auth/google/callback", {"code": "c", "state": "s1"})
    assert resp.status_code == 302
    user = get_user_model().objects.get(email="known@example.com")
    assert not AuditLog.objects.filter(action="auth.register", actor=user).exists()
    assert AuditLog.objects.filter(action="auth.login", actor=user).exists()


def test_callback_state_mismatch_redirects_to_login_with_error() -> None:
    client = Client()
    client.cookies["g_oauth_state"] = "real-state"
    resp = client.get("/api/auth/google/callback", {"code": "c", "state": "forged"})
    assert resp.status_code == 302
    assert resp["Location"] == f"{FRONTEND}/login?error=state_mismatch"
    assert AuditLog.objects.filter(action="auth.login_failed").exists()


def test_callback_user_denied_consent() -> None:
    resp = Client().get("/api/auth/google/callback", {"error": "access_denied"})
    assert resp.status_code == 302
    assert resp["Location"] == f"{FRONTEND}/login?error=access_denied"
