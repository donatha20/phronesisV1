from __future__ import annotations

from django.contrib import admin

from .models import PodcastEpisode


@admin.register(PodcastEpisode)
class PodcastEpisodeAdmin(admin.ModelAdmin):
    list_display = ("title", "series", "media_type", "sphere", "release_date", "views_count")
    list_filter = ("media_type", "sphere")
    search_fields = ("title", "series", "speaker")
