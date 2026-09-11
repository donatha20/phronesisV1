from __future__ import annotations

from rest_framework import serializers

from apps.common.choices import UserRole

from .models import ApplicationStatus, Mentorship, MentorshipApplication


class MentorshipApplicationSerializer(serializers.ModelSerializer):
    mentee_name = serializers.CharField(source="mentee.display_name", read_only=True)
    mentor_name = serializers.CharField(source="mentor.display_name", read_only=True)

    class Meta:
        model = MentorshipApplication
        fields = (
            "id", "mentee", "mentee_name", "mentor", "mentor_name", "chosen_sphere",
            "personal_introduction", "growth_desire", "meeting_frequency",
            "status", "decided_at", "created_at",
        )
        read_only_fields = ("id", "mentee", "status", "decided_at", "created_at")

    def validate_mentor(self, mentor):  # type: ignore[no-untyped-def]
        if mentor.role.base_kind != UserRole.MENTOR:
            raise serializers.ValidationError("Applications can only be sent to mentors.")
        return mentor

    def validate(self, attrs: dict) -> dict:
        user = self.context["request"].user
        if self.instance is None and user.role.base_kind != UserRole.MENTEE:
            raise serializers.ValidationError("Only mentees may apply for mentorship.")
        return attrs

    def create(self, validated_data: dict) -> MentorshipApplication:
        validated_data["mentee"] = self.context["request"].user
        return super().create(validated_data)


class MentorshipSerializer(serializers.ModelSerializer):
    mentee_name = serializers.CharField(source="mentee.display_name", read_only=True)
    mentor_name = serializers.CharField(source="mentor.display_name", read_only=True)

    class Meta:
        model = Mentorship
        fields = (
            "id", "mentee", "mentee_name", "mentor", "mentor_name",
            "application", "paired_at", "is_active", "ended_at", "created_at",
        )
        read_only_fields = fields


__all__ = ["MentorshipApplicationSerializer", "MentorshipSerializer", "ApplicationStatus"]
