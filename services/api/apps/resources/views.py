from __future__ import annotations

from django.db.models import Count, Exists, OuterRef, Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import ReadOnlyOrMentor, is_admin, is_mentor
from apps.common.storage import DirectUploadNotSupported, generate_presigned_post
from apps.common.viewsets import AuditedModelViewSet

from .models import Resource, ResourceAccessTier, ResourceBookmark, ResourceEnrollment
from .serializers import ResourceSerializer

_MEMBER_ACTIONS = {"list", "retrieve", "bookmark", "enroll"}


class ResourceViewSet(AuditedModelViewSet):
    queryset = Resource.objects.none()
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["type", "sphere", "access_tier"]

    def get_permissions(self):  # type: ignore[no-untyped-def]
        if self.action in _MEMBER_ACTIONS:
            return [IsAuthenticated()]
        return [ReadOnlyOrMentor()]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        qs = Resource.objects.select_related("uploaded_by").annotate(
            is_bookmarked_by_me=Exists(ResourceBookmark.objects.filter(resource=OuterRef("pk"), user=user)),
            is_enrolled=Exists(ResourceEnrollment.objects.filter(resource=OuterRef("pk"), user=user)),
            enrolled_users_count=Count("enrollments", distinct=True),
        )
        if is_admin(user):
            return qs
        allowed = Q(access_tier__in=[ResourceAccessTier.OPEN_PUBLIC, ResourceAccessTier.REGISTERED_DISCIPLES])
        allowed |= Q(uploaded_by=user)
        allowed |= Q(access_tier=ResourceAccessTier.ENROLLED_COHORT, enrollments__user=user)
        if is_mentor(user):
            allowed |= Q(access_tier=ResourceAccessTier.ELDERS_ONLY)
        return qs.filter(allowed).distinct()

    def _owner_or_admin(self, obj: Resource) -> bool:
        return is_admin(self.request.user) or obj.uploaded_by_id == self.request.user.id

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(serializer.instance):
            raise PermissionDenied("Only the uploader may edit this resource.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(instance):
            raise PermissionDenied("Only the uploader may delete this resource.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post", "delete"])
    def bookmark(self, request, pk=None):  # type: ignore[no-untyped-def]
        resource = self.get_object()
        if request.method == "POST":
            ResourceBookmark.objects.get_or_create(resource=resource, user=request.user)
        else:
            ResourceBookmark.objects.filter(resource=resource, user=request.user).delete()
        return Response(self.get_serializer(self.get_queryset().get(pk=resource.pk)).data)

    @action(detail=True, methods=["post"])
    def enroll(self, request, pk=None):  # type: ignore[no-untyped-def]
        resource = self.get_object()
        ResourceEnrollment.objects.get_or_create(resource=resource, user=request.user)
        return Response(self.get_serializer(self.get_queryset().get(pk=resource.pk)).data)

    @action(detail=False, methods=["post"], url_path="presign-upload")
    def presign_upload(self, request):  # type: ignore[no-untyped-def]
        """`POST /api/resources/presign-upload/` `{filename, contentType}` ->
        a presigned S3 POST for the browser to upload directly, plus the
        `key` to send back as `file_key` when creating/updating the resource."""
        filename = request.data.get("filename", "").strip()
        content_type = request.data.get("contentType", "application/octet-stream")
        if not filename:
            return Response({"detail": "filename is required"}, status=400)
        try:
            result = generate_presigned_post(
                key_prefix="resources/uploads", filename=filename, content_type=content_type
            )
        except DirectUploadNotSupported as exc:
            return Response({"code": "direct_upload_not_supported", "detail": str(exc)}, status=501)
        return Response(result)
