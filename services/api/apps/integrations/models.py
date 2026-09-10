from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.common.fields import EncryptedTextField
from apps.common.models import BaseModel


class GoogleWorkspaceToken(BaseModel):
    """Server-side Google Workspace OAuth credentials for the Drive/Calendar/Meet
    broker (phase P5). Separate from "Login with Google" (which is identity only).

    The refresh token is encrypted at rest with ``settings.FIELD_ENCRYPTION_KEY``.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="google_workspace_token"
    )
    google_account_email = models.EmailField(blank=True)
    encrypted_refresh_token = EncryptedTextField()
    scopes = models.JSONField(default=list, blank=True)
    access_token_expiry = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Google Workspace token"

    def __str__(self) -> str:
        return f"GoogleWorkspaceToken({self.user_id})"
