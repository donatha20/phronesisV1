from __future__ import annotations

from rest_framework import serializers

from apps.common.serializers import JSONStringFieldsMixin

from .models import Resource


class ResourceSerializer(JSONStringFieldsMixin, serializers.ModelSerializer):
    json_string_fields = ("syllabus_chapters", "key_scripture_anchors")
    uploaded_by_name = serializers.SerializerMethodField()
    is_bookmarked_by_me = serializers.BooleanField(read_only=True)
    is_enrolled = serializers.BooleanField(read_only=True)
    enrolled_users_count = serializers.IntegerField(read_only=True)
    # Set instead of `file` when the browser already uploaded straight to S3
    # via a presigned POST (see `ResourceViewSet.presign_upload`) — the value
    # is the storage-relative key that endpoint returned.
    file_key = serializers.CharField(write_only=True, required=False, allow_blank=False)

    class Meta:
        model = Resource
        fields = (
            "id", "title", "author", "type", "sphere", "description", "read_time",
            "file", "file_key", "external_url", "file_size_bytes", "rating", "access_tier",
            "syllabus_chapters", "key_scripture_anchors", "uploaded_by", "uploaded_by_name",
            "is_bookmarked_by_me", "is_enrolled", "enrolled_users_count", "created_at",
        )
        read_only_fields = ("id", "uploaded_by", "file_size_bytes", "created_at")

    def get_uploaded_by_name(self, obj: Resource) -> str:
        return obj.uploaded_by.display_name if obj.uploaded_by else ""

    def _apply_file_key(self, resource: Resource, file_key: str | None) -> None:
        if not file_key:
            return
        resource.file.name = file_key
        resource.file_size_bytes = resource.file.size
        resource.save(update_fields=["file", "file_size_bytes"])

    def create(self, validated_data: dict) -> Resource:
        file_key = validated_data.pop("file_key", None)
        validated_data["uploaded_by"] = self.context["request"].user
        resource = super().create(validated_data)
        if resource.file and not file_key:
            resource.file_size_bytes = getattr(resource.file, "size", None)
            resource.save(update_fields=["file_size_bytes"])
        self._apply_file_key(resource, file_key)
        return resource

    def update(self, instance: Resource, validated_data: dict) -> Resource:
        file_key = validated_data.pop("file_key", None)
        resource = super().update(instance, validated_data)
        self._apply_file_key(resource, file_key)
        return resource
