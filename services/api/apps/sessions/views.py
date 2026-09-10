from __future__ import annotations

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.permissions import is_admin
from apps.common.viewsets import AuditedModelViewSet

from .models import DiscipleshipSession, SessionStatus
from .serializers import DiscipleshipSessionSerializer


class DiscipleshipSessionViewSet(AuditedModelViewSet):
    queryset = DiscipleshipSession.objects.none()
    serializer_class = DiscipleshipSessionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["status", "platform", "sphere_focus", "mentee", "mentor"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = DiscipleshipSession.objects.select_related("mentee", "mentor")
        if is_admin(user):
            return qs
        return qs.filter(Q(mentee=user) | Q(mentor=user))

    def _is_participant(self, obj: DiscipleshipSession) -> bool:
        return self.request.user.id in (obj.mentee_id, obj.mentor_id) or is_admin(self.request.user)

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not self._is_participant(serializer.instance):
            raise PermissionDenied("You are not a participant in this session.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not self._is_participant(instance):
            raise PermissionDenied("You are not a participant in this session.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):  # type: ignore[no-untyped-def]
        session = self.get_object()
        if not self._is_participant(session):
            raise PermissionDenied("You are not a participant in this session.")
        session.status = SessionStatus.CANCELLED
        session.save(update_fields=["status", "updated_at"])
        self._audit("update", session)
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):  # type: ignore[no-untyped-def]
        session = self.get_object()
        if not self._is_participant(session):
            raise PermissionDenied("You are not a participant in this session.")
        session.status = SessionStatus.COMPLETED
        notes = request.data.get("meeting_notes")
        action_items = request.data.get("action_items")
        if notes is not None:
            session.meeting_notes = notes
        if action_items is not None:
            session.action_items = action_items
        session.save(update_fields=["status", "meeting_notes", "action_items", "updated_at"])
        self._audit("update", session)
        return Response(self.get_serializer(session).data)
