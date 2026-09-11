from __future__ import annotations

from typing import Any

from dj_rest_auth.registration.serializers import RegisterSerializer as BaseRegisterSerializer
from rest_framework import serializers

from .models import Role, SecuritySettings, User, UserRole


class UserSerializer(serializers.ModelSerializer):
    """Shape returned by ``GET /api/auth/user/`` and embedded elsewhere."""

    display_name = serializers.CharField(read_only=True)
    role = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    # A custom role's `role` slug can be anything an admin named it (e.g.
    # "youth-pastor") — `role_base_kind` is always one of mentee/mentor/admin,
    # so clients can gate UI/behavior on this instead of the specific slug.
    role_base_kind = serializers.CharField(source="role.base_kind", read_only=True)
    role_name = serializers.CharField(source="role.name", read_only=True)
    devotion_streak_days = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "display_name",
            "role",
            "role_base_kind",
            "role_name",
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
            "devotion_streak_days",
            "date_joined",
        )
        read_only_fields = (
            "id",
            "email",
            "avatar_initial",
            "is_verified_elder",
            "active_mentees_count",
            "discipleship_hours",
            "date_joined",
        )

    def get_devotion_streak_days(self, obj: User) -> int:
        """Only meaningful (and only computed) for the signed-in user's own
        record — avoids an N+1 query per row in listings like the mentor
        directory, where nobody's streak but your own is relevant."""
        request = self.context.get("request")
        if request is None or not getattr(request, "user", None) or request.user.id != obj.id:
            return 0
        from apps.devotions.services import compute_streak_days

        return compute_streak_days(obj)


class SecuritySettingsSerializer(serializers.ModelSerializer):
    """The current user's own security preferences.

    There is no PIN/biometric vault mechanism (see PrayerRequest privacy model) —
    only a real, storable preference flag plus informational timestamps.
    """

    class Meta:
        model = SecuritySettings
        fields = ("two_factor_enabled", "last_vault_unlock_at", "last_password_change_at")
        read_only_fields = ("last_vault_unlock_at", "last_password_change_at")


class RoleSerializer(serializers.ModelSerializer):
    """Admin-only role management (`/api/admin/roles/`)."""

    class Meta:
        model = Role
        fields = ("id", "name", "slug", "base_kind", "capabilities", "is_system", "description", "created_at")
        read_only_fields = ("id", "is_system", "created_at")

    def validate(self, attrs: dict) -> dict:
        instance = self.instance
        if instance and instance.is_system:
            if "slug" in attrs and attrs["slug"] != instance.slug:
                raise serializers.ValidationError("System roles cannot be renamed (slug is fixed).")
            if "base_kind" in attrs and attrs["base_kind"] != instance.base_kind:
                raise serializers.ValidationError("A system role's base_kind cannot be changed.")
        return attrs


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin-only user directory (`/api/admin/users/`) — read-only except
    the dedicated `role` action, which is audited separately."""

    display_name = serializers.CharField(read_only=True)
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            "id", "email", "first_name", "last_name", "display_name",
            "role", "is_active", "is_staff", "date_joined",
        )
        read_only_fields = fields


class RegisterSerializer(BaseRegisterSerializer):
    """Email/password registration with optional display name.

    Role is intentionally NOT accepted from the client — new accounts are
    always mentees; elevation to mentor/admin (or any custom role) happens
    through the admin-only role-assignment endpoint (`PATCH /api/admin/users/{id}/role/`).
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
        user.role = Role.resolve(UserRole.MENTEE)
        user.first_name = self.get_cleaned_data()["first_name"]
        user.last_name = self.get_cleaned_data()["last_name"]
        user.save(update_fields=["role", "first_name", "last_name", "avatar_initial"])
        return user
