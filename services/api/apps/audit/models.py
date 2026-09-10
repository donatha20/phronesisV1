from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.models import UUIDModel


class AuditAction(models.TextChoices):
    # auth
    LOGIN = "auth.login", _("User logged in")
    LOGIN_FAILED = "auth.login_failed", _("Failed login attempt")
    LOGOUT = "auth.logout", _("User logged out")
    REGISTER = "auth.register", _("Account created")
    PASSWORD_CHANGE = "auth.password_change", _("Password changed")
    ROLE_CHANGE = "account.role_change", _("Role changed")
    # prayer vault
    PRAYER_VIEW = "prayer.view", _("Prayer request viewed")
    PRAYER_CREATE = "prayer.create", _("Prayer request created")
    PRAYER_UPDATE = "prayer.update", _("Prayer request updated")
    PRAYER_DELETE = "prayer.delete", _("Prayer request deleted")
    VAULT_UNLOCK = "prayer.vault_unlock", _("Prayer vault unlocked")
    VAULT_UNLOCK_FAILED = "prayer.vault_unlock_failed", _("Prayer vault unlock failed")
    # google integration
    GOOGLE_CONNECT = "integration.google_connect", _("Google Workspace connected")
    GOOGLE_DISCONNECT = "integration.google_disconnect", _("Google Workspace disconnected")
    # generic
    CREATE = "record.create", _("Record created")
    UPDATE = "record.update", _("Record updated")
    DELETE = "record.delete", _("Record deleted")


class AuditLog(UUIDModel):
    """Append-only audit trail. Never updated or deleted in application code."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_events",
    )
    actor_email = models.EmailField(blank=True)  # denormalised: survives user deletion
    action = models.CharField(max_length=48, choices=AuditAction.choices, db_index=True)
    target_type = models.CharField(max_length=64, blank=True, db_index=True)
    target_id = models.CharField(max_length=64, blank=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=400, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=["action", "-created_at"]),
            models.Index(fields=["actor", "-created_at"]),
            models.Index(fields=["target_type", "target_id"]),
        ]

    def __str__(self) -> str:
        who = self.actor_email or "system"
        return f"{self.created_at:%Y-%m-%d %H:%M} {who} {self.action}"
