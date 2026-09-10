from __future__ import annotations

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.permissions import is_admin, is_mentor
from apps.common.viewsets import AuditedModelViewSet
from apps.mentorship.selectors import active_mentee_ids_for

from .models import Goal, Milestone
from .serializers import GoalSerializer, MilestoneSerializer


class GoalViewSet(AuditedModelViewSet):
    queryset = Goal.objects.none()
    serializer_class = GoalSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["sphere", "status", "assigned_to"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = Goal.objects.select_related("created_by", "assigned_to").prefetch_related("milestones")
        if is_admin(user):
            return qs
        if is_mentor(user):
            return qs.filter(Q(assigned_to=user) | Q(created_by=user) | Q(assigned_to_id__in=active_mentee_ids_for(user)))
        return qs.filter(Q(assigned_to=user) | Q(created_by=user))

    def _can_edit(self, goal: Goal) -> bool:
        user = self.request.user
        return (
            is_admin(user)
            or goal.assigned_to_id == user.id
            or goal.created_by_id == user.id
            or (is_mentor(user) and goal.assigned_to_id in set(active_mentee_ids_for(user)))
        )

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not self._can_edit(serializer.instance):
            raise PermissionDenied("You may not edit this goal.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not (self.request.user.id == instance.assigned_to_id or is_admin(self.request.user)):
            raise PermissionDenied("Only the goal owner may delete it.")
        super().perform_destroy(instance)

    # --- milestones -------------------------------------------------------
    @action(detail=True, methods=["post"], url_path="milestones")
    def add_milestone(self, request, pk=None):  # type: ignore[no-untyped-def]
        goal = self.get_object()
        if not self._can_edit(goal):
            raise PermissionDenied("You may not edit this goal.")
        serializer = MilestoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(goal=goal, order=goal.milestones.count())
        goal.recompute_progress()
        goal.save(update_fields=["progress_percent"])
        return Response(self.get_serializer(goal).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path=r"milestones/(?P<milestone_id>[^/.]+)")
    def update_milestone(self, request, pk=None, milestone_id=None):  # type: ignore[no-untyped-def]
        goal = self.get_object()
        if not self._can_edit(goal):
            raise PermissionDenied("You may not edit this goal.")
        try:
            milestone = goal.milestones.get(pk=milestone_id)
        except Milestone.DoesNotExist:
            return Response({"detail": "Milestone not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = MilestoneSerializer(milestone, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        goal.recompute_progress()
        goal.save(update_fields=["progress_percent"])
        return Response(self.get_serializer(goal).data)
