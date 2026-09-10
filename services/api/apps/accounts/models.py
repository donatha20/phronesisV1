from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.models import TimeStampedModel

from .managers import UserManager


class UserRole(models.TextChoices):
    MENTEE = "mentee", _("Young Believer / Mentee")
    MENTOR = "mentor", _("Mentor / Elder")
    ADMIN = "admin", _("Administrator")


class LifeSphere(models.TextChoices):
    PERSONAL_GROWTH = "personal_growth", _("Personal Growth")
    RELATIONSHIPS = "relationships", _("Relationships & Family")
    VOCATION = "vocation", _("Vocation & Work")
    STEWARDSHIP = "stewardship", _("Financial Stewardship")
    MINISTRY = "ministry", _("Ministry & Service")


class User(AbstractUser):
    """Email-first custom user."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # type: ignore[assignment]
    email = models.EmailField(_("email address"), unique=True)

    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.MENTEE)
    avatar_initial = models.CharField(max_length=2, blank=True)
    bio = models.TextField(blank=True)
    focus_spheres = models.JSONField(default=list, blank=True)
    profile_completed = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        db_table = "accounts_user"

    def __str__(self) -> str:
        return self.email

    def save(self, *args, **kwargs):  # type: ignore[no-untyped-def]
        if not self.avatar_initial:
            source = (self.first_name or self.email or "?").strip()
            self.avatar_initial = source[:1].upper()
        super().save(*args, **kwargs)


class SecuritySettings(TimeStampedModel):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="security_settings"
    )
    two_factor_enabled = models.BooleanField(default=False)
    vault_pin_set = models.BooleanField(default=False)
    last_vault_unlock_at = models.DateTimeField(null=True, blank=True)
    last_password_change_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name_plural = "security settings"

    def __str__(self) -> str:
        return f"SecuritySettings({self.user.email})"
