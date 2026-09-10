from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class ApplicationStatus(models.TextChoices):
    PENDING = "pending", _("Pending")
    ACCEPTED = "accepted", _("Accepted")
    ACTIVE = "active", _("Active")
    DECLINED = "declined", _("Declined")


class MentorshipApplication(BaseModel):
    mentee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_applications_sent"
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorship_applications_received"
    )
    chosen_sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    personal_introduction = models.TextField(blank=True)
    growth_desire = models.TextField(blank=True)
    meeting_frequency = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=16, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING
    )
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["mentee", "mentor"],
                condition=models.Q(status__in=["pending", "accepted", "active"]),
                name="uniq_open_application_per_pair",
            )
        ]

    def __str__(self) -> str:
        return f"{self.mentee_id} -> {self.mentor_id} ({self.status})"


class Mentorship(BaseModel):
    """An active mentee<->mentor pairing. A mentee has at most one active mentor."""

    mentee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorships_as_mentee"
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentorships_as_mentor"
    )
    application = models.OneToOneField(
        MentorshipApplication, on_delete=models.SET_NULL, null=True, blank=True, related_name="mentorship"
    )
    paired_at = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["mentee"],
                condition=models.Q(is_active=True),
                name="uniq_active_mentorship_per_mentee",
            )
        ]

    def __str__(self) -> str:
        return f"{self.mentee_id} with {self.mentor_id}"
