from __future__ import annotations

from django.contrib import admin

from .models import PrayerRequest


@admin.register(PrayerRequest)
class PrayerRequestAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category_sphere", "privacy_level", "is_answered", "created_at")
    list_filter = ("privacy_level", "category_sphere", "is_answered")
    search_fields = ("title", "author__email")
    # Private-vault bodies are deliberately not surfaced in list/search previews.
