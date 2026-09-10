from __future__ import annotations

from rest_framework import serializers

from .models import DiscipleshipSession


class DiscipleshipSessionSerializer(serializers.ModelSerializer):
    mentee_name = serializers.CharField(source="mentee.display_name", read_only=True)
    mentor_name = serializers.CharField(source="mentor.display_name", read_only=True)

    class Meta:
        model = DiscipleshipSession
        fields = (
            "id", "mentee", "mentee_name", "mentor", "mentor_name",
            "scheduled_at", "duration_minutes", "sphere_focus", "topic",
            "scripture_text", "platform", "status",
            "meeting_notes", "action_items", "post_session_prayer",
            "meeting_link", "google_calendar_event_id", "meet_space_id", "meet_url",
            "created_at", "updated_at",
        )
        read_only_fields = (
            "id", "status",
            # populated server-side by the Google Workspace broker (P5)
            "meeting_link", "google_calendar_event_id", "meet_space_id", "meet_url",
            "created_at", "updated_at",
        )

    def validate(self, attrs: dict) -> dict:
        user = self.context["request"].user
        mentee = attrs.get("mentee") or getattr(self.instance, "mentee", None)
        mentor = attrs.get("mentor") or getattr(self.instance, "mentor", None)
        if self.instance is None:
            if user not in (mentee, mentor):
                raise serializers.ValidationError("You must be a participant in the session you create.")
            from apps.mentorship.selectors import are_paired

            if mentee and mentor and not are_paired(mentee, mentor):
                raise serializers.ValidationError("Sessions can only be scheduled between paired mentee and mentor.")
        return attrs
