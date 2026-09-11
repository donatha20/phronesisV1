from __future__ import annotations

from django.db.models import Count, Exists, F, OuterRef
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.common.permissions import ReadOnlyOrMentor, is_admin
from apps.common.storage import DirectUploadNotSupported, generate_presigned_post
from apps.common.viewsets import AuditedModelViewSet

from .models import EpisodeLike, EpisodeSave, PodcastEpisode
from .serializers import PodcastEpisodeSerializer

_MEMBER_ACTIONS = {"list", "retrieve", "like", "save"}


class PodcastEpisodeViewSet(AuditedModelViewSet):
    queryset = PodcastEpisode.objects.none()
    serializer_class = PodcastEpisodeSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["sphere", "media_type", "series"]

    def get_permissions(self):  # type: ignore[no-untyped-def]
        if self.action in _MEMBER_ACTIONS:
            return [IsAuthenticated()]
        return [ReadOnlyOrMentor()]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        user = self.request.user
        return (
            PodcastEpisode.objects.select_related("uploaded_by")
            .annotate(
                likes_count=Count("likes", distinct=True),
                is_liked_by_me=Exists(EpisodeLike.objects.filter(episode=OuterRef("pk"), user=user)),
                is_saved_by_me=Exists(EpisodeSave.objects.filter(episode=OuterRef("pk"), user=user)),
            )
            .order_by("-release_date", "-created_at")
        )

    def retrieve(self, request, *args, **kwargs):  # type: ignore[no-untyped-def]
        instance = self.get_object()
        PodcastEpisode.objects.filter(pk=instance.pk).update(views_count=F("views_count") + 1)
        instance.refresh_from_db(fields=["views_count"])
        return Response(self.get_serializer(instance).data)

    def _owner_or_admin(self, obj: PodcastEpisode) -> bool:
        return is_admin(self.request.user) or obj.uploaded_by_id == self.request.user.id

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(serializer.instance):
            raise PermissionDenied("Only the uploader may edit this episode.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(instance):
            raise PermissionDenied("Only the uploader may delete this episode.")
        super().perform_destroy(instance)

    @action(detail=True, methods=["post", "delete"])
    def like(self, request, pk=None):  # type: ignore[no-untyped-def]
        episode = self.get_object()
        if request.method == "POST":
            EpisodeLike.objects.get_or_create(episode=episode, user=request.user)
        else:
            EpisodeLike.objects.filter(episode=episode, user=request.user).delete()
        return Response(self.get_serializer(self.get_queryset().get(pk=episode.pk)).data)

    @action(detail=True, methods=["post", "delete"])
    def save(self, request, pk=None):  # type: ignore[no-untyped-def]
        episode = self.get_object()
        if request.method == "POST":
            EpisodeSave.objects.get_or_create(episode=episode, user=request.user)
        else:
            EpisodeSave.objects.filter(episode=episode, user=request.user).delete()
        return Response(self.get_serializer(self.get_queryset().get(pk=episode.pk)).data)

    @action(detail=False, methods=["post"], url_path="presign-upload")
    def presign_upload(self, request):  # type: ignore[no-untyped-def]
        """`POST /api/episodes/presign-upload/` `{filename, contentType}` ->
        a presigned S3 POST for the browser to upload audio/video directly,
        plus the `key` to send back as `media_file_key` on create/update."""
        filename = request.data.get("filename", "").strip()
        content_type = request.data.get("contentType", "application/octet-stream")
        if not filename:
            return Response({"detail": "filename is required"}, status=400)
        try:
            result = generate_presigned_post(
                key_prefix="media/episodes/uploads", filename=filename, content_type=content_type
            )
        except DirectUploadNotSupported as exc:
            return Response({"code": "direct_upload_not_supported", "detail": str(exc)}, status=501)
        return Response(result)
