from __future__ import annotations

from rest_framework import serializers

from .models import Devotion, DevotionComment


class DevotionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_me = serializers.BooleanField(read_only=True)

    class Meta:
        model = DevotionComment
        fields = (
            "id", "devotion", "author", "author_name", "author_role",
            "text", "likes_count", "is_liked_by_me", "created_at",
        )
        read_only_fields = ("id", "devotion", "author", "created_at")

    def get_author_name(self, obj: DevotionComment) -> str:
        return obj.author.display_name if obj.author else "Former member"

    def get_author_role(self, obj: DevotionComment) -> str:
        return obj.author.role.slug if obj.author else ""


class DevotionSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    author_role = serializers.SerializerMethodField()
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    is_liked_by_me = serializers.BooleanField(read_only=True)

    class Meta:
        model = Devotion
        fields = (
            "id", "title", "date", "theme", "author", "author_name", "author_role",
            "author_title", "scripture_reference", "scripture_text", "reflection_body",
            "prayer_point", "practical_action_step", "audio_voice_note",
            "audio_duration_seconds", "category_sphere", "tags", "read_time_minutes",
            "likes_count", "comments_count", "is_liked_by_me", "created_at", "updated_at",
        )
        read_only_fields = ("id", "author", "created_at", "updated_at")

    def get_author_name(self, obj: Devotion) -> str:
        return obj.author.display_name if obj.author else "Former member"

    def get_author_role(self, obj: Devotion) -> str:
        return obj.author.role.slug if obj.author else ""

    def create(self, validated_data: dict) -> Devotion:
        user = self.context["request"].user
        validated_data["author"] = user
        if not validated_data.get("author_title"):
            validated_data["author_title"] = user.title
        return super().create(validated_data)
