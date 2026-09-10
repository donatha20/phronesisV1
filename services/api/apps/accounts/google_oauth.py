"""Server-side "Login with Google" via the OAuth 2.0 authorization-code flow
(full-page redirect). Identity only — scopes are ``openid email profile``.

Google Workspace *data* access (Drive/Calendar/Meet) is a separate broker added
in phase P5 under ``apps.integrations``; it must not be conflated with login.
"""
from __future__ import annotations

import os
from dataclasses import dataclass

from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from google_auth_oauthlib.flow import Flow

LOGIN_SCOPES = ["openid", "email", "profile"]


class GoogleOAuthError(Exception):
    """Any failure in the Google login exchange. ``.code`` is a short slug the
    frontend can map to a friendly message."""

    def __init__(self, code: str, detail: str = "") -> None:
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


@dataclass(frozen=True)
class GoogleIdentity:
    email: str
    email_verified: bool
    given_name: str
    family_name: str
    sub: str


def _config() -> dict:
    conf = settings.GOOGLE_LOGIN
    if not conf["CLIENT_ID"] or not conf["CLIENT_SECRET"]:
        raise GoogleOAuthError("not_configured", "Google login is not configured on the server.")
    return conf


def _flow(state: str | None = None) -> Flow:
    conf = _config()
    if settings.DEBUG:
        # allow the http://localhost callback in local development
        os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")
    client_config = {
        "web": {
            "client_id": conf["CLIENT_ID"],
            "client_secret": conf["CLIENT_SECRET"],
            "auth_uri": "https://accounts.google.com/o/oauth2/v2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    return Flow.from_client_config(
        client_config,
        scopes=LOGIN_SCOPES,
        redirect_uri=conf["REDIRECT_URI"],
        state=state,
    )


def build_authorization_url() -> tuple[str, str]:
    """Return ``(authorization_url, state)``. Caller must persist ``state`` and
    check it on the callback."""
    flow = _flow()
    url, state = flow.authorization_url(
        access_type="online",
        include_granted_scopes="true",
        prompt="select_account",
    )
    return url, state


def exchange_code_for_identity(*, code: str, state: str) -> GoogleIdentity:
    flow = _flow(state=state)
    try:
        flow.fetch_token(code=code)
    except Exception as exc:  # noqa: BLE001 - oauthlib raises many shapes
        raise GoogleOAuthError("token_exchange_failed", str(exc)) from exc

    raw_id_token = getattr(flow.credentials, "id_token", None)
    if not raw_id_token:
        raise GoogleOAuthError("no_id_token", "Google did not return an ID token.")

    try:
        info = google_id_token.verify_oauth2_token(
            raw_id_token, google_requests.Request(), _config()["CLIENT_ID"]
        )
    except ValueError as exc:
        raise GoogleOAuthError("id_token_invalid", str(exc)) from exc

    email = (info.get("email") or "").lower()
    if not email:
        raise GoogleOAuthError("no_email", "Google account has no email address.")
    if not info.get("email_verified", False):
        raise GoogleOAuthError("email_unverified", "Google email address is not verified.")

    return GoogleIdentity(
        email=email,
        email_verified=True,
        given_name=info.get("given_name", "") or "",
        family_name=info.get("family_name", "") or "",
        sub=info.get("sub", "") or "",
    )
