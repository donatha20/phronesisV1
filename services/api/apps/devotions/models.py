from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


def devotion_audio_path(instance: Devotion, filename: str) -> str:
    return f"devotions/{instance.pk or 'new'}/audio/{filename}"


class Devotion(BaseModel):
    title = models.CharField(max_length=200)
    date = models.DateField()
    theme = models.CharField(max_length=150, blank=True)

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="devotions"
    )
    author_title = models.CharField(max_length=150, blank=True)

    scripture_reference = models.CharField(max_length=150, blank=True)
    scripture_text = models.TextField(blank=True)
    reflection_body = models.TextField(blank=True)
    prayer_point = models.TextField(blank=True)
    practical_action_step = models.TextField(blank=True)

    audio_voice_note = models.FileField(upload_to=devotion_audio_path, null=True, blank=True)
    audio_duration_seconds = models.PositiveIntegerField(default=0)

    category_sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    tags = models.JSONField(default=list, blank=True)
    read_time_minutes = models.PositiveSmallIntegerField(default=3)

    class Meta:
        ordering = ("-date", "-created_at")

    def __str__(self) -> str:
        return self.title


class DevotionLike(BaseModel):
    devotion = models.ForeignKey(Devotion, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="devotion_likes"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["devotion", "user"], name="uniq_devotion_like")
        ]


class DevotionComment(BaseModel):
    devotion = models.ForeignKey(Devotion, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="devotion_comments"
    )
    text = models.TextField()

    class Meta:
        ordering = ("created_at",)

    def __str__(self) -> str:
        return f"comment on {self.devotion_id}"


class DevotionCommentLike(BaseModel):
    comment = models.ForeignKey(DevotionComment, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="devotion_comment_likes"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["comment", "user"], name="uniq_devotion_comment_like")
        ]
