from __future__ import annotations

from django.db import IntegrityError, transaction
from django.db.models import F, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.models import User
from apps.audit.models import AuditAction
from apps.audit.services import record
from apps.common.permissions import is_admin, is_mentor
from apps.common.viewsets import AuditedModelViewSet

from .models import ApplicationStatus, Mentorship, MentorshipApplication
from .serializers import MentorshipApplicationSerializer, MentorshipSerializer


class MentorshipApplicationViewSet(AuditedModelViewSet):
    queryset = MentorshipApplication.objects.none()
    serializer_class = MentorshipApplicationSerializer
    http_method_names = ["get", "post", "delete", "head", "options"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = MentorshipApplication.objects.select_related("mentee", "mentor")
        if is_admin(user):
            return qs
        return qs.filter(Q(mentee=user) | Q(mentor=user))

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if instance.mentee_id != self.request.user.id and not is_admin(self.request.user):
            raise PermissionDenied("Only the applicant may withdraw this application.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):  # type: ignore[no-untyped-def]
        app = self.get_object()
        if app.mentor_id != request.user.id and not is_admin(request.user):
            raise PermissionDenied("Only the addressed mentor may accept this application.")
        if app.status not in (ApplicationStatus.PENDING, ApplicationStatus.ACCEPTED):
            raise ValidationError("This application is no longer open.")
        if Mentorship.objects.filter(mentee=app.mentee, is_active=True).exists():
            raise ValidationError("This mentee already has an active mentor.")
        try:
            with transaction.atomic():
                mentorship = Mentorship.objects.create(
                    mentee=app.mentee, mentor=app.mentor, application=app,
                    paired_at=timezone.now().date(),
                )
                app.status = ApplicationStatus.ACTIVE
                app.decided_at = timezone.now()
                app.save(update_fields=["status", "decided_at"])
                User.objects.filter(pk=app.mentor_id).update(
                    active_mentees_count=F("active_mentees_count") + 1
                )
        except IntegrityError as exc:
            raise ValidationError("Could not create the pairing.") from exc
        record(AuditAction.CREATE, target=mentorship, metadata={"via": "application_accept"})
        return Response(MentorshipSerializer(mentorship).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):  # type: ignore[no-untyped-def]
        app = self.get_object()
        if app.mentor_id != request.user.id and not is_admin(request.user):
            raise PermissionDenied("Only the addressed mentor may decline this application.")
        app.status = ApplicationStatus.DECLINED
        app.decided_at = timezone.now()
        app.save(update_fields=["status", "decided_at"])
        record(AuditAction.UPDATE, target=app, metadata={"declined": True})
        return Response(self.get_serializer(app).data)


class MentorshipViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    queryset = Mentorship.objects.none()
    serializer_class = MentorshipSerializer

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = Mentorship.objects.select_related("mentee", "mentor")
        if is_admin(user):
            return qs
        return qs.filter(Q(mentee=user) | Q(mentor=user))

    @action(detail=True, methods=["post"])
    def end(self, request, pk=None):  # type: ignore[no-untyped-def]
        mentorship = self.get_object()
        if request.user.id not in (mentorship.mentee_id, mentorship.mentor_id) and not is_admin(request.user):
            raise PermissionDenied("You are not part of this mentorship.")
        if mentorship.is_active:
            mentorship.is_active = False
            mentorship.ended_at = timezone.now()
            mentorship.save(update_fields=["is_active", "ended_at"])
            if is_mentor(mentorship.mentor):
                User.objects.filter(pk=mentorship.mentor_id, active_mentees_count__gt=0).update(
                    active_mentees_count=F("active_mentees_count") - 1
                )
            record(AuditAction.UPDATE, target=mentorship, metadata={"ended": True})
        return Response(self.get_serializer(mentorship).data)
