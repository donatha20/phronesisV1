from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.common.permissions import is_admin, is_mentor
from apps.mentorship.selectors import active_mentee_ids_for

from .models import Goal, Milestone

User = get_user_model()


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ("id", "title", "is_completed", "completed_date", "order", "created_at")
        read_only_fields = ("id", "created_at")


class GoalSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, required=False)
    mentor_fields_editable = serializers.SerializerMethodField()
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False
    )

    class Meta:
        model = Goal
        fields = (
            "id", "sphere", "title", "description", "scripture_anchor", "target_date",
            "status", "check_in_frequency", "progress_percent",
            "mentor_feedback", "mentor_approved",
            "created_by", "assigned_to", "milestones",
            "mentor_fields_editable", "created_at", "updated_at",
        )
        read_only_fields = ("id", "created_by", "progress_percent", "created_at", "updated_at")

    def get_mentor_fields_editable(self, obj: Goal) -> bool:
        user = self.context["request"].user
        return is_admin(user) or (is_mentor(user) and obj.assigned_to_id in set(active_mentee_ids_for(user)))

    def validate(self, attrs: dict) -> dict:
        user = self.context["request"].user
        # mentor-only fields
        if not self.instance:  # create
            mentor_locked = {"mentor_feedback", "mentor_approved"}
            if mentor_locked & attrs.keys() and not (is_mentor(user) or is_admin(user)):
                raise serializers.ValidationError("Only a mentor may set mentor feedback/approval.")
        else:
            if ("mentor_feedback" in attrs or "mentor_approved" in attrs) and not self.get_mentor_fields_editable(self.instance):
                raise serializers.ValidationError("You may not edit mentor feedback/approval on this goal.")

        assigned_to = attrs.get("assigned_to")
        if assigned_to and assigned_to != user:
            if not (is_admin(user) or (is_mentor(user) and assigned_to.id in set(active_mentee_ids_for(user)))):
                raise serializers.ValidationError("You can only assign goals to yourself or your mentees.")
        return attrs

    def create(self, validated_data: dict) -> Goal:
        milestones = validated_data.pop("milestones", [])
        user = self.context["request"].user
        validated_data["created_by"] = user
        validated_data.setdefault("assigned_to", user)
        goal = Goal.objects.create(**validated_data)
        for i, m in enumerate(milestones):
            Milestone.objects.create(goal=goal, order=m.get("order", i), **{
                k: v for k, v in m.items() if k != "order"
            })
        goal.recompute_progress()
        goal.save(update_fields=["progress_percent"])
        return goal

    def update(self, instance: Goal, validated_data: dict) -> Goal:
        validated_data.pop("milestones", None)  # milestones managed via their own endpoint
        goal = super().update(instance, validated_data)
        goal.recompute_progress()
        goal.save(update_fields=["progress_percent"])
        return goal
