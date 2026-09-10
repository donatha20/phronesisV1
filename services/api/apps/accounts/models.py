from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere, UserRole
from apps.common.models import TimeStampedModel

from .managers import UserManager

__all__ = ["User", "SecuritySettings", "UserRole", "LifeSphere"]


class User(AbstractUser):
    """Email-first custom user, carrying the mentorship profile fields that the
    client models as ``UserProfile`` (apps/web/src/types.ts).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None  # type: ignore[assignment]
    email = models.EmailField(_("email address"), unique=True)

    # identity / role
    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.MENTEE)
    avatar_initial = models.CharField(max_length=2, blank=True)
    profile_completed = models.BooleanField(default=False)

    # public profile
    title = models.CharField(max_length=150, blank=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    location = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    full_biography = models.TextField(blank=True)
    ministry_journey = models.TextField(blank=True)
    mentorship_philosophy = models.TextField(blank=True)
    availability_schedule = models.CharField(max_length=255, blank=True)
    church_community = models.CharField(max_length=200, blank=True)
    years_in_faith = models.PositiveSmallIntegerField(null=True, blank=True)
    favorite_scripture = models.CharField(max_length=255, blank=True)

    spiritual_gifts = models.JSONField(default=list, blank=True)
    primary_spheres = models.JSONField(default=list, blank=True)
    focus_spheres = models.JSONField(default=list, blank=True)
    badges = models.JSONField(default=list, blank=True)

    # contact
    phone = models.CharField(max_length=40, blank=True)
    whatsapp_number = models.CharField(max_length=40, blank=True)
    telegram_username = models.CharField(max_length=100, blank=True)

    # mentor metrics
    is_verified_elder = models.BooleanField(default=False)
    active_mentees_count = models.PositiveIntegerField(default=0)
    discipleship_hours = models.PositiveIntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    class Meta:
        db_table = "accounts_user"

    def __str__(self) -> str:
        return self.email

    @property
    def display_name(self) -> str:
        full = f"{self.first_name} {self.last_name}".strip()
        return full or self.email

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
