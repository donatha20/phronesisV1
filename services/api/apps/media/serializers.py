from __future__ import annotations

from rest_framework import serializers

from .models import PodcastEpisode


class PodcastEpisodeSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_me = serializers.BooleanField(read_only=True)
    is_saved_by_me = serializers.BooleanField(read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PodcastEpisode
        fields = (
            "id", "title", "series", "speaker", "speaker_role", "media_type",
            "media_file", "video_embed_url", "cover_image_theme", "duration_seconds",
            "release_date", "sphere", "description", "key_scriptures", "key_takeaways",
            "views_count", "uploaded_by", "uploaded_by_name",
            "likes_count", "is_liked_by_me", "is_saved_by_me", "created_at",
        )
        read_only_fields = ("id", "uploaded_by", "views_count", "created_at")

    def get_uploaded_by_name(self, obj: PodcastEpisode) -> str:
        return obj.uploaded_by.display_name if obj.uploaded_by else ""

    def create(self, validated_data: dict) -> PodcastEpisode:
        validated_data["uploaded_by"] = self.context["request"].user
        return super().create(validated_data)
