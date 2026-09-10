from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class MediaType(models.TextChoices):
    AUDIO = "audio", _("Audio")
    VIDEO = "video", _("Video")


def episode_media_path(instance: PodcastEpisode, filename: str) -> str:
    return f"media/episodes/{instance.pk or 'new'}/{filename}"


class PodcastEpisode(BaseModel):
    title = models.CharField(max_length=200)
    series = models.CharField(max_length=150, blank=True)
    speaker = models.CharField(max_length=150, blank=True)
    speaker_role = models.CharField(max_length=150, blank=True)

    media_type = models.CharField(max_length=8, choices=MediaType.choices, default=MediaType.AUDIO)
    media_file = models.FileField(upload_to=episode_media_path, null=True, blank=True)
    video_embed_url = models.URLField(blank=True)
    cover_image_theme = models.CharField(max_length=50, blank=True)

    duration_seconds = models.PositiveIntegerField(default=0)
    release_date = models.DateField(null=True, blank=True)
    sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    description = models.TextField(blank=True)
    key_scriptures = models.JSONField(default=list, blank=True)
    key_takeaways = models.JSONField(default=list, blank=True)

    views_count = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="episodes_uploaded",
    )

    class Meta:
        ordering = ("-release_date", "-created_at")

    def __str__(self) -> str:
        return self.title


class EpisodeLike(BaseModel):
    episode = models.ForeignKey(PodcastEpisode, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="episode_likes"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["episode", "user"], name="uniq_episode_like")
        ]


class EpisodeSave(BaseModel):
    episode = models.ForeignKey(PodcastEpisode, on_delete=models.CASCADE, related_name="saves")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="episode_saves"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["episode", "user"], name="uniq_episode_save")
        ]
