from __future__ import annotations

from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from apps.accounts.models import SecuritySettings
from apps.audit.models import AuditAction
from apps.audit.services import record
from apps.common.permissions import is_admin
from apps.common.viewsets import AuditedModelViewSet
from apps.mentorship.selectors import active_mentee_ids_for

from .models import PrayerIntercession, PrayerPrivacy, PrayerRequest
from .serializers import PrayerRequestSerializer, vault_unlocked


class PrayerRequestViewSet(AuditedModelViewSet):
    queryset = PrayerRequest.objects.none()
    serializer_class = PrayerRequestSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category_sphere", "privacy_level", "is_answered"]
    owner_field = "author"
    audit_actions = {
        "create": AuditAction.PRAYER_CREATE,
        "update": AuditAction.PRAYER_UPDATE,
        "destroy": AuditAction.PRAYER_DELETE,
    }

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = PrayerRequest.objects.select_related("author").annotate(
            intercessors_count=Count("intercessions", distinct=True),
            is_prayed_by_me=Exists(
                PrayerIntercession.objects.filter(prayer=OuterRef("pk"), user=user)
            ),
        )
        if is_admin(user):
            return qs
        visible = Q(author=user) | Q(privacy_level=PrayerPrivacy.COMMUNITY_INTERCESSORS)
        # a mentor may see their mentees' MENTOR_ONLY requests
        mentee_ids = list(active_mentee_ids_for(user))
        if mentee_ids:
            visible |= Q(privacy_level=PrayerPrivacy.MENTOR_ONLY, author_id__in=mentee_ids)
        return qs.filter(visible)

    def retrieve(self, request, *args, **kwargs):  # type: ignore[no-untyped-def]
        instance = self.get_object()
        if instance.privacy_level in (PrayerPrivacy.PRIVATE_VAULT, PrayerPrivacy.MENTOR_ONLY):
            record(AuditAction.PRAYER_VIEW, target=instance,
                   metadata={"privacy": instance.privacy_level})
        return Response(self.get_serializer(instance).data)

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not (is_admin(self.request.user) or serializer.instance.author_id == self.request.user.id):
            raise PermissionDenied("Only the author may edit this prayer request.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not (is_admin(self.request.user) or instance.author_id == self.request.user.id):
            raise PermissionDenied("Only the author may delete this prayer request.")
        super().perform_destroy(instance)

    # --- vault unlock (password re-auth) --------------------------------
    @action(detail=False, methods=["post"], url_path="vault/unlock")
    def vault_unlock(self, request):  # type: ignore[no-untyped-def]
        password = request.data.get("password", "")
        user = request.user
        ok = bool(password) and authenticate(
            request, username=user.email, password=password
        ) is not None
        if not ok:
            record(AuditAction.VAULT_UNLOCK_FAILED)
            raise ValidationError({"password": "Incorrect password."})
        ss, _ = SecuritySettings.objects.get_or_create(user=user)
        ss.last_vault_unlock_at = timezone.now()
        ss.save(update_fields=["last_vault_unlock_at", "updated_at"])
        record(AuditAction.VAULT_UNLOCK)
        window = getattr(settings, "PRAYER_VAULT_UNLOCK_MINUTES", 10)
        return Response({"unlocked": True, "unlocked_for_minutes": window})

    @action(detail=False, methods=["get"], url_path="vault/status")
    def vault_status(self, request):  # type: ignore[no-untyped-def]
        return Response({"unlocked": vault_unlocked(request.user)})

    # --- intercession -------------------------------------------------
    @action(detail=True, methods=["post", "delete"])
    def intercede(self, request, pk=None):  # type: ignore[no-untyped-def]
        prayer = self.get_object()
        if prayer.privacy_level == PrayerPrivacy.PRIVATE_VAULT:
            raise PermissionDenied("Private vault requests cannot be interceded on.")
        if request.method == "POST":
            PrayerIntercession.objects.get_or_create(prayer=prayer, user=request.user)
        else:
            PrayerIntercession.objects.filter(prayer=prayer, user=request.user).delete()
        return Response(self.get_serializer(self.get_queryset().get(pk=prayer.pk)).data)

    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):  # type: ignore[no-untyped-def]
        prayer = self.get_object()
        if prayer.author_id != request.user.id and not is_admin(request.user):
            raise PermissionDenied("Only the author may mark this answered.")
        prayer.is_answered = True
        prayer.praise_report = request.data.get("praise_report", prayer.praise_report)
        prayer.answered_at = timezone.now()
        prayer.save(update_fields=["is_answered", "praise_report", "answered_at", "updated_at"])
        record(AuditAction.PRAYER_UPDATE, target=prayer, metadata={"answered": True})
        return Response(self.get_serializer(prayer).data)
