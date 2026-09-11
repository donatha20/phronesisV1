from __future__ import annotations

from django.db.models import Count, Exists, OuterRef
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.audit.models import AuditAction
from apps.audit.services import record
from apps.common.permissions import is_admin
from apps.common.viewsets import AuditedModelViewSet

from .models import Devotion, DevotionComment, DevotionCommentLike, DevotionLike, DevotionReadLog
from .serializers import DevotionCommentSerializer, DevotionSerializer


def _annotate_for(qs, user):  # type: ignore[no-untyped-def]
    return qs.annotate(
        likes_count=Count("likes", distinct=True),
        comments_count=Count("comments", distinct=True),
        is_liked_by_me=Exists(DevotionLike.objects.filter(devotion=OuterRef("pk"), user=user)),
    )


class DevotionViewSet(AuditedModelViewSet):
    queryset = Devotion.objects.none()
    serializer_class = DevotionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["category_sphere", "author"]

    def get_queryset(self):  # type: ignore[no-untyped-def]
        return _annotate_for(
            Devotion.objects.select_related("author"), self.request.user
        ).order_by("-date", "-created_at")

    def _owner_or_admin(self, obj: Devotion) -> bool:
        return is_admin(self.request.user) or obj.author_id == self.request.user.id

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(serializer.instance):
            raise PermissionDenied("Only the author may edit this devotion.")
        super().perform_update(serializer)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        if not self._owner_or_admin(instance):
            raise PermissionDenied("Only the author may delete this devotion.")
        super().perform_destroy(instance)

    # --- likes ----------------------------------------------------------
    @action(detail=True, methods=["post", "delete"])
    def like(self, request, pk=None):  # type: ignore[no-untyped-def]
        devotion = self.get_object()
        if request.method == "POST":
            DevotionLike.objects.get_or_create(devotion=devotion, user=request.user)
        else:
            DevotionLike.objects.filter(devotion=devotion, user=request.user).delete()
        return Response(self.get_serializer(self.get_queryset().get(pk=devotion.pk)).data)

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):  # type: ignore[no-untyped-def]
        """Records that the caller opened this devotion — feeds the daily
        streak (`UserSerializer.devotion_streak_days`). Idempotent per user
        per devotion, so re-opening it doesn't change anything."""
        devotion = self.get_object()
        DevotionReadLog.objects.get_or_create(devotion=devotion, user=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # --- comments -----------------------------------------------------
    @action(detail=True, methods=["get", "post"])
    def comments(self, request, pk=None):  # type: ignore[no-untyped-def]
        devotion = self.get_object()
        base = DevotionComment.objects.filter(devotion=devotion).select_related("author").annotate(
            likes_count=Count("likes", distinct=True),
            is_liked_by_me=Exists(
                DevotionCommentLike.objects.filter(comment=OuterRef("pk"), user=request.user)
            ),
        ).order_by("created_at")

        if request.method == "GET":
            page = self.paginate_queryset(base)
            ser = DevotionCommentSerializer(page or base, many=True, context=self.get_serializer_context())
            return self.get_paginated_response(ser.data) if page is not None else Response(ser.data)

        ser = DevotionCommentSerializer(data=request.data, context=self.get_serializer_context())
        ser.is_valid(raise_exception=True)
        comment = ser.save(devotion=devotion, author=request.user)
        record(AuditAction.CREATE, target=comment)
        out = base.get(pk=comment.pk)
        return Response(
            DevotionCommentSerializer(out, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], url_path=r"comments/(?P<comment_id>[^/.]+)")
    def delete_comment(self, request, pk=None, comment_id=None):  # type: ignore[no-untyped-def]
        devotion = self.get_object()
        try:
            comment = devotion.comments.get(pk=comment_id)
        except DevotionComment.DoesNotExist:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        if not (is_admin(request.user) or comment.author_id == request.user.id):
            raise PermissionDenied("You may not delete this comment.")
        record(AuditAction.DELETE, target=comment)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post", "delete"], url_path=r"comments/(?P<comment_id>[^/.]+)/like")
    def like_comment(self, request, pk=None, comment_id=None):  # type: ignore[no-untyped-def]
        devotion = self.get_object()
        try:
            comment = devotion.comments.get(pk=comment_id)
        except DevotionComment.DoesNotExist:
            return Response({"detail": "Comment not found."}, status=status.HTTP_404_NOT_FOUND)
        if request.method == "POST":
            DevotionCommentLike.objects.get_or_create(comment=comment, user=request.user)
        else:
            DevotionCommentLike.objects.filter(comment=comment, user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
