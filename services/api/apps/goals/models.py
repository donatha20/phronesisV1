from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class GoalStatus(models.TextChoices):
    ACTIVE = "active", _("Active")
    COMPLETED = "completed", _("Completed")
    PAUSED = "paused", _("Paused")
    UNDER_REVIEW = "under_review", _("Under Review")


class Goal(BaseModel):
    sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    scripture_anchor = models.CharField(max_length=255, blank=True)
    target_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=GoalStatus.choices, default=GoalStatus.ACTIVE)

    check_in_frequency = models.CharField(max_length=100, blank=True)
    progress_percent = models.PositiveSmallIntegerField(default=0)

    mentor_feedback = models.TextField(blank=True)
    mentor_approved = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals_created"
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals_assigned"
    )

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title

    def recompute_progress(self) -> int:
        milestones = list(self.milestones.all())
        if not milestones:
            return self.progress_percent
        done = sum(1 for m in milestones if m.is_completed)
        self.progress_percent = round(done / len(milestones) * 100)
        return self.progress_percent


class Milestone(BaseModel):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    completed_date = models.DateField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("order", "created_at")

    def __str__(self) -> str:
        return self.title
