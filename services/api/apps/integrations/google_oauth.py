"""Server-side Google Workspace OAuth (Drive / Calendar / Meet) — phase P5.

This is a SEPARATE broker from "Login with Google" (``apps.accounts.google_oauth``,
identity-only). A user must already be signed in to Phronesis before connecting
Workspace; connecting never creates or logs in an account.

Flow: authorization-code, ``access_type=offline`` + ``prompt=consent`` so we
always get a refresh token, which is encrypted at rest on ``GoogleWorkspaceToken``.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import UTC, datetime

from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow


class GoogleWorkspaceError(Exception):
    def __init__(self, code: str, detail: str = "") -> None:
        super().__init__(detail or code)
        self.code = code
        self.detail = detail


@dataclass(frozen=True)
class WorkspaceGrant:
    email: str
    refresh_token: str
    access_token: str
    scopes: list[str]
    expiry: datetime | None


def _config() -> dict:
    conf = settings.GOOGLE_WORKSPACE
    if not conf["CLIENT_ID"] or not conf["CLIENT_SECRET"]:
        raise GoogleWorkspaceError("not_configured", "Google Workspace is not configured on the server.")
    return conf


def _scopes() -> list[str]:
    raw = _config()["SCOPES"]
    return [s for s in raw.split() if s]


def _flow(state: str | None = None) -> Flow:
    conf = _config()
    if settings.DEBUG:
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
        client_config, scopes=_scopes(), redirect_uri=conf["REDIRECT_URI"], state=state
    )


def build_authorization_url() -> tuple[str, str]:
    flow = _flow()
    url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    return url, state


def exchange_code_for_grant(*, code: str, state: str) -> WorkspaceGrant:
    flow = _flow(state=state)
    try:
        flow.fetch_token(code=code)
    except Exception as exc:  # noqa: BLE001
        raise GoogleWorkspaceError("token_exchange_failed", str(exc)) from exc

    creds = flow.credentials
    if not creds.refresh_token:
        raise GoogleWorkspaceError(
            "no_refresh_token",
            "Google did not return a refresh token. Revoke prior access at "
            "https://myaccount.google.com/permissions and try connecting again.",
        )

    email = ""
    try:
        # `userinfo.email` scope is not requested; fall back to the id token if present.
        if creds.id_token:
            from google.oauth2 import id_token as google_id_token

            info = google_id_token.verify_oauth2_token(
                creds.id_token, google_requests.Request(), _config()["CLIENT_ID"]
            )
            email = (info.get("email") or "").lower()
    except Exception:  # noqa: BLE001 - email is a nice-to-have here
        email = ""

    expiry = creds.expiry.replace(tzinfo=UTC) if creds.expiry else None
    return WorkspaceGrant(
        email=email,
        refresh_token=creds.refresh_token,
        access_token=creds.token or "",
        scopes=list(creds.scopes or _scopes()),
        expiry=expiry,
    )


def credentials_from_refresh_token(refresh_token: str) -> Credentials:
    """Build a live ``Credentials`` object; ``.refresh()`` will use this to
    mint a fresh access token on demand."""
    conf = _config()
    return Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=conf["CLIENT_ID"],
        client_secret=conf["CLIENT_SECRET"],
        scopes=_scopes(),
    )


def revoke_refresh_token(refresh_token: str) -> None:
    import requests

    try:
        requests.post(
            "https://oauth2.googleapis.com/revoke",
            params={"token": refresh_token},
            headers={"content-type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
    except Exception:  # noqa: BLE001 - best-effort; local disconnect still proceeds
        pass
