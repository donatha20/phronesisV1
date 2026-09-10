from __future__ import annotations

from django.contrib import admin

from .models import Mentorship, MentorshipApplication


@admin.register(MentorshipApplication)
class MentorshipApplicationAdmin(admin.ModelAdmin):
    list_display = ("mentee", "mentor", "chosen_sphere", "status", "created_at")
    list_filter = ("status", "chosen_sphere")
    search_fields = ("mentee__email", "mentor__email")


@admin.register(Mentorship)
class MentorshipAdmin(admin.ModelAdmin):
    list_display = ("mentee", "mentor", "paired_at", "is_active")
    list_filter = ("is_active",)
    search_fields = ("mentee__email", "mentor__email")
