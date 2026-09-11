from __future__ import annotations

from typing import Any

from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from rest_framework import serializers

from .models import SecuritySettings, User, UserRole


class UserSerializer(serializers.ModelSerializer):
    """Shape returned by ``GET /api/auth/user/`` and embedded elsewhere."""

    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "display_name",
            "role",
            "avatar_initial",
            "profile_completed",
            "title",
            "age",
            "location",
            "bio",
            "full_biography",
            "ministry_journey",
            "mentorship_philosophy",
            "availability_schedule",
            "church_community",
            "years_in_faith",
            "favorite_scripture",
            "spiritual_gifts",
            "primary_spheres",
            "focus_spheres",
            "badges",
            "phone",
            "whatsapp_number",
            "telegram_username",
            "is_verified_elder",
            "active_mentees_count",
            "discipleship_hours",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "email",
            "role",
            "avatar_initial",
            "is_verified_elder",
            "active_mentees_count",
            "discipleship_hours",
            "date_joined",
        )


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """The current user's own security preferences.

    There is no PIN/biometric vault mechanism (see PrayerRequest privacy model) —
    only a real, storable preference flag plus informational timestamps.
    """

    class Meta:
        model = SecuritySettings
        fields = ("two_factor_enabled", "last_vault_unlock_at", "last_password_change_at")
        read_only_fields = ("last_vault_unlock_at", "last_password_change_at")


class RegisterSerializer(BaseRegisterSerializer):
    """Email/password registration with optional display name.

    Role is intentionally NOT accepted from the client — new accounts are always
    mentees; elevation to mentor/admin happens through a reviewed flow.
    """

    username = None
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def get_cleaned_data(self) -> dict[str, Any]:
        data = super().get_cleaned_data()
        data["first_name"] = self.validated_data.get("first_name", "")
        data["last_name"] = self.validated_data.get("last_name", "")
        return data

    def save(self, request):  # type: ignore[no-untyped-def]
        user = super().save(request)
        user.role = UserRole.MENTEE
        user.first_name = self.get_cleaned_data()["first_name"]
        user.last_name = self.get_cleaned_data()["last_name"]
        user.save(update_fields=["role", "first_name", "last_name", "avatar_initial"])
        return user
