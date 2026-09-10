from __future__ import annotations

from django.contrib import admin

from .models import DiscipleshipSession


@admin.register(DiscipleshipSession)
class DiscipleshipSessionAdmin(admin.ModelAdmin):
    list_display = ("topic", "scheduled_at", "mentee", "mentor", "platform", "status")
    list_filter = ("status", "platform", "sphere_focus")
    search_fields = ("topic", "mentee__email", "mentor__email")
    date_hierarchy = "scheduled_at"
