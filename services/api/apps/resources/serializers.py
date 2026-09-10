from __future__ import annotations

from rest_framework import serializers

from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    is_bookmarked_by_me = serializers.BooleanField(read_only=True)
    is_enrolled = serializers.BooleanField(read_only=True)
    enrolled_users_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Resource
        fields = (
            "id", "title", "author", "type", "sphere", "description", "read_time",
            "file", "external_url", "file_size_bytes", "rating", "access_tier",
            "syllabus_chapters", "key_scripture_anchors", "uploaded_by", "uploaded_by_name",
            "is_bookmarked_by_me", "is_enrolled", "enrolled_users_count", "created_at",
        )
        read_only_fields = ("id", "uploaded_by", "file_size_bytes", "created_at")

    def get_uploaded_by_name(self, obj: Resource) -> str:
        return obj.uploaded_by.display_name if obj.uploaded_by else ""

    def create(self, validated_data: dict) -> Resource:
        validated_data["uploaded_by"] = self.context["request"].user
        resource = super().create(validated_data)
        if resource.file:
            resource.file_size_bytes = getattr(resource.file, "size", None)
            resource.save(update_fields=["file_size_bytes"])
        return resource
