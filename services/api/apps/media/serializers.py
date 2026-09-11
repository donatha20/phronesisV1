from __future__ import annotations

from rest_framework import serializers

from apps.common.serializers import JSONStringFieldsMixin

from .models import PodcastEpisode


class PodcastEpisodeSerializer(JSONStringFieldsMixin, serializers.ModelSerializer):
    json_string_fields = ("key_scriptures", "key_takeaways")
    likes_count = serializers.IntegerField(read_only=True)
    is_liked_by_me = serializers.BooleanField(read_only=True)
    is_saved_by_me = serializers.BooleanField(read_only=True)
    uploaded_by_name = serializers.SerializerMethodField()
    # Set instead of `media_file` when the browser already uploaded straight
    # to S3 via a presigned POST (see `PodcastEpisodeViewSet.presign_upload`).
    media_file_key = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = PodcastEpisode
        fields = (
            "id", "title", "series", "speaker", "speaker_role", "media_type",
            "media_file", "media_file_key", "video_embed_url", "cover_image_theme",
            "duration_seconds", "release_date", "sphere", "description",
            "key_scriptures", "key_takeaways",
            "views_count", "uploaded_by", "uploaded_by_name",
            "likes_count", "is_liked_by_me", "is_saved_by_me", "created_at",
        )
        read_only_fields = ("id", "uploaded_by", "views_count", "created_at")

    def get_uploaded_by_name(self, obj: PodcastEpisode) -> str:
        return obj.uploaded_by.display_name if obj.uploaded_by else ""

    def _apply_media_file_key(self, episode: PodcastEpisode, media_file_key: str | None) -> None:
        if not media_file_key:
            return
        episode.media_file.name = media_file_key
        episode.save(update_fields=["media_file"])

    def create(self, validated_data: dict) -> PodcastEpisode:
        media_file_key = validated_data.pop("media_file_key", None)
        validated_data["uploaded_by"] = self.context["request"].user
        episode = super().create(validated_data)
        self._apply_media_file_key(episode, media_file_key)
        return episode

    def update(self, instance: PodcastEpisode, validated_data: dict) -> PodcastEpisode:
        media_file_key = validated_data.pop("media_file_key", None)
        episode = super().update(instance, validated_data)
        self._apply_media_file_key(episode, media_file_key)
        return episode
