from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class PrayerPrivacy(models.TextChoices):
    PRIVATE_VAULT = "private_vault", _("Private vault (author only)")
    MENTOR_ONLY = "mentor_only", _("Author + assigned mentor")
    COMMUNITY_INTERCESSORS = "community_intercessors", _("Community intercessors")


class PrayerRequest(BaseModel):
    """v1 confidentiality model is access control + audit logging (see apps.audit).
    No application-layer encryption; ``PRIVATE_VAULT`` requires a password re-auth
    step at the API before the body is returned.
    """

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prayer_requests"
    )
    title = models.CharField(max_length=200)
    prayer_need = models.TextField()
    category_sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    privacy_level = models.CharField(
        max_length=32, choices=PrayerPrivacy.choices, default=PrayerPrivacy.PRIVATE_VAULT
    )
    is_answered = models.BooleanField(default=False)
    praise_report = models.TextField(blank=True)
    answered_at = models.DateTimeField(null=True, blank=True)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [models.Index(fields=["privacy_level", "-created_at"])]

    def __str__(self) -> str:
        return self.title


class PrayerIntercession(BaseModel):
    """One 'I prayed for this' mark. Count = intercessors; membership = isPrayedByMe."""

    prayer = models.ForeignKey(
        PrayerRequest, on_delete=models.CASCADE, related_name="intercessions"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="prayer_intercessions"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["prayer", "user"], name="uniq_prayer_intercession")
        ]
