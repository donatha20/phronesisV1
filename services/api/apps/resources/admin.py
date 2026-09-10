from __future__ import annotations

from django.contrib import admin

from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "sphere", "access_tier", "rating", "uploaded_by")
    list_filter = ("type", "sphere", "access_tier")
    search_fields = ("title", "author")
