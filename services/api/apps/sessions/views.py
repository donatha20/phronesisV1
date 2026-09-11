from __future__ import annotations

import secrets
from datetime import timedelta

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from googleapiclient.errors import HttpError
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.permissions import is_admin
from apps.common.viewsets import AuditedModelViewSet
from apps.integrations import google_client
from apps.integrations.google_oauth import GoogleWorkspaceError

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

    @action(detail=True, methods=["post"], url_path="generate-meet-link")
    def generate_meet_link(self, request, pk=None):  # type: ignore[no-untyped-def]
        """Mints a real Google Meet link for this session via the caller's
        connected Google Workspace (`apps.integrations`) and persists it.
        Idempotent — a session that already has one is returned unchanged."""
        session = self.get_object()
        if not self._is_participant(session):
            raise PermissionDenied("You are not a participant in this session.")
        if session.meet_url:
            return Response(self.get_serializer(session).data)

        try:
            service = google_client.calendar_service(request.user)
        except GoogleWorkspaceError as exc:
            code = 409 if exc.code == "not_connected" else 502
            return Response({"code": exc.code, "detail": str(exc)}, status=code)

        start = session.scheduled_at
        end = start + timedelta(minutes=session.duration_minutes or 45)
        event_body = {
            "summary": f"[Phronesis] {session.topic}",
            "description": f"Discipleship session: {session.mentee.display_name} & {session.mentor.display_name}",
            "start": {"dateTime": start.isoformat()},
            "end": {"dateTime": end.isoformat()},
            "conferenceData": {
                "createRequest": {
                    "requestId": secrets.token_hex(8),
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                }
            },
        }
        try:
            result = service.events().insert(
                calendarId="primary", body=event_body, conferenceDataVersion=1
            ).execute()
        except HttpError as exc:
            return Response({"code": "google_api_error", "detail": str(exc)}, status=502)

        meet_url = ""
        for entry in result.get("conferenceData", {}).get("entryPoints", []):
            if entry.get("entryPointType") == "video":
                meet_url = entry.get("uri", "")
                break

        session.meet_url = meet_url
        session.meeting_link = meet_url
        session.google_calendar_event_id = result.get("id", "")
        session.save(
            update_fields=["meet_url", "meeting_link", "google_calendar_event_id", "updated_at"]
        )
        self._audit("update", session)
        return Response(self.get_serializer(session).data, status=status.HTTP_201_CREATED)
