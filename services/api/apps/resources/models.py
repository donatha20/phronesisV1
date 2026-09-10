from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

from apps.common.choices import LifeSphere
from apps.common.models import BaseModel


class ResourceType(models.TextChoices):
    PDF_GUIDE = "pdf_guide", _("PDF guide")
    STUDY_SERIES = "study_series", _("Study series")
    SERMON_TRANSCRIPT = "sermon_transcript", _("Sermon transcript")
    BOOK_RECOMMENDATION = "book_recommendation", _("Book recommendation")


class ResourceAccessTier(models.TextChoices):
    OPEN_PUBLIC = "open_public", _("Open / public")
    REGISTERED_DISCIPLES = "registered_disciples", _("Registered disciples")
    ELDERS_ONLY = "elders_only", _("Elders only")
    ENROLLED_COHORT = "enrolled_cohort", _("Enrolled cohort")


def resource_file_path(instance: Resource, filename: str) -> str:
    return f"resources/{instance.pk or 'new'}/{filename}"


class Resource(BaseModel):
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=150, blank=True)
    type = models.CharField(max_length=32, choices=ResourceType.choices)
    sphere = models.CharField(max_length=32, choices=LifeSphere.choices)
    description = models.TextField(blank=True)
    read_time = models.CharField(max_length=50, blank=True)

    file = models.FileField(upload_to=resource_file_path, null=True, blank=True)
    external_url = models.URLField(blank=True)
    file_size_bytes = models.PositiveBigIntegerField(null=True, blank=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    access_tier = models.CharField(
        max_length=32, choices=ResourceAccessTier.choices, default=ResourceAccessTier.OPEN_PUBLIC
    )
    syllabus_chapters = models.JSONField(default=list, blank=True)
    key_scripture_anchors = models.JSONField(default=list, blank=True)

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="resources_uploaded",
    )

    class Meta:
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.title


class ResourceBookmark(BaseModel):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="bookmarks")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resource_bookmarks"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["resource", "user"], name="uniq_resource_bookmark")
        ]


class ResourceEnrollment(BaseModel):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="enrollments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="resource_enrollments"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["resource", "user"], name="uniq_resource_enrollment")
        ]
