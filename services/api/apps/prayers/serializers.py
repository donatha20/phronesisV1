from __future__ import annotations

from django.conf import settings
from django.utils import timezone
from rest_framework import serializers

from .models import PrayerPrivacy, PrayerRequest

_MASKED = "••• Hidden — unlock the vault to view •••"


def vault_unlocked(user) -> bool:  # type: ignore[no-untyped-def]
    ss = getattr(user, "security_settings", None)
    if not ss or not ss.last_vault_unlock_at:
        return False
    window = getattr(settings, "PRAYER_VAULT_UNLOCK_MINUTES", 10)
    return ss.last_vault_unlock_at >= timezone.now() - timezone.timedelta(minutes=window)


class PrayerRequestSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.display_name", read_only=True)
    intercessors_count = serializers.IntegerField(read_only=True)
    is_prayed_by_me = serializers.BooleanField(read_only=True)
    is_body_hidden = serializers.SerializerMethodField()

    class Meta:
        model = PrayerRequest
        fields = (
            "id", "author", "author_name", "title", "prayer_need",
            "category_sphere", "privacy_level", "is_answered", "praise_report",
            "answered_at", "tags", "intercessors_count", "is_prayed_by_me",
            "is_body_hidden", "created_at", "updated_at",
        )
        read_only_fields = ("id", "author", "is_answered", "answered_at", "created_at", "updated_at")

    # -- body masking for the private vault --------------------------------
    def _should_hide_body(self, obj: PrayerRequest) -> bool:
        if obj.privacy_level != PrayerPrivacy.PRIVATE_VAULT:
            return False
        user = self.context["request"].user
        if obj.author_id != user.id:
            return True
        return not vault_unlocked(user)

    def get_is_body_hidden(self, obj: PrayerRequest) -> bool:
        return self._should_hide_body(obj)

    def to_representation(self, obj: PrayerRequest) -> dict:
        data = super().to_representation(obj)
        if self._should_hide_body(obj):
            data["prayer_need"] = _MASKED
            data["praise_report"] = ""
        return data

    def create(self, validated_data: dict) -> PrayerRequest:
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
