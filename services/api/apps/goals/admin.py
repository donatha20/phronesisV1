from __future__ import annotations

from django.contrib import admin

from .models import Goal, Milestone


class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 0


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("title", "sphere", "status", "progress_percent", "assigned_to", "mentor_approved")
    list_filter = ("sphere", "status", "mentor_approved")
    search_fields = ("title", "assigned_to__email", "created_by__email")
    inlines = [MilestoneInline]
