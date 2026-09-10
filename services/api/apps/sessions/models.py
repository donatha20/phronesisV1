from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class SessionStatus(models.TextChoices):
    SCHEDULED = "scheduled", _("Scheduled")
    IN_PROGRESS = "in_progress", _("In progress")
    COMPLETED = "completed", _("Completed")
    CANCELLED = "cancelled", _("Cancelled")


class SessionPlatform(models.TextChoices):
    GOOGLE_MEET = "google_meet", _("Google Meet")
    IN_APP_VIDEO = "in_app_video", _("In-app video")
    IN_APP_AUDIO = "in_app_audio", _("In-app audio")
    AUDIO_ROOM = "audio_room", _("Audio room")
    WHATSAPP = "whatsapp", _("WhatsApp")
    ZOOM = "zoom", _("Zoom")
    IN_PERSON = "in_person", _("In person")


class DiscipleshipSession(BaseModel):
    mentee = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_as_mentee"
    )
    mentor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions_as_mentor"
    )

    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField(default=45)
    sphere_focus = models.CharField(max_length=32, choices=LifeSphere.choices)
    topic = models.CharField(max_length=200, blank=True)
    scripture_text = models.TextField(blank=True)

    platform = models.CharField(
        max_length=16, choices=SessionPlatform.choices, default=SessionPlatform.GOOGLE_MEET
    )
    status = models.CharField(
        max_length=16, choices=SessionStatus.choices, default=SessionStatus.SCHEDULED
    )

    meeting_notes = models.TextField(blank=True)
    action_items = models.JSONField(default=list, blank=True)
    post_session_prayer = models.TextField(blank=True)

    # populated by the Google Workspace broker (phase P5)
    meeting_link = models.URLField(blank=True)
    google_calendar_event_id = models.CharField(max_length=1024, blank=True)
    meet_space_id = models.CharField(max_length=255, blank=True)
    meet_url = models.URLField(blank=True)

    class Meta:
        ordering = ("-scheduled_at",)

    def __str__(self) -> str:
        return f"{self.topic or 'Session'} @ {self.scheduled_at:%Y-%m-%d %H:%M}"
