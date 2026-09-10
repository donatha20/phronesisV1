from __future__ import annotations

from django.contrib import admin

from .models import Devotion, DevotionComment


class CommentInline(admin.TabularInline):
    model = DevotionComment
    extra = 0
    readonly_fields = ("author", "text", "created_at")


@admin.register(Devotion)
class DevotionAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "category_sphere", "author")
    list_filter = ("category_sphere", "date")
    search_fields = ("title", "theme", "author__email")
    inlines = [CommentInline]
