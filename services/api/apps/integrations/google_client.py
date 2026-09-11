"""Authorized Drive/Calendar clients built from a user's stored, encrypted
refresh token. Access tokens are minted on demand and never persisted."""
from __future__ import annotations

from django.utils import timezone
from google.auth.transport import requests as google_requests
from googleapiclient.discovery import Resource, build

from .google_oauth import GoogleWorkspaceError, credentials_from_refresh_token
from .models import GoogleWorkspaceToken


def get_active_token(user) -> GoogleWorkspaceToken:
    try:
        token = user.google_workspace_token
    except GoogleWorkspaceToken.DoesNotExist as exc:
        raise GoogleWorkspaceError("not_connected", "Google Workspace is not connected.") from exc
    if token.revoked_at is not None:
        raise GoogleWorkspaceError("not_connected", "Google Workspace access was revoked.")
    return token


def _credentials(token: GoogleWorkspaceToken):
    creds = credentials_from_refresh_token(token.encrypted_refresh_token)
    try:
        creds.refresh(google_requests.Request())
    except Exception as exc:  # noqa: BLE001
        raise GoogleWorkspaceError(
            "refresh_failed", "Google access could not be refreshed; please reconnect."
        ) from exc
    if creds.expiry:
        token.access_token_expiry = timezone.make_aware(creds.expiry) if timezone.is_naive(creds.expiry) else creds.expiry
        token.save(update_fields=["access_token_expiry", "updated_at"])
    return creds


def drive_service(user) -> Resource:
    token = get_active_token(user)
    return build("drive", "v3", credentials=_credentials(token), cache_discovery=False)


def calendar_service(user) -> Resource:
    token = get_active_token(user)
    return build("calendar", "v3", credentials=_credentials(token), cache_discovery=False)
