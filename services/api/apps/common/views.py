from __future__ import annotations

from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthzView(APIView):
    """Liveness probe — process is up."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []

    def get(self, request: Request) -> Response:
        return Response({"status": "ok"})


class ReadyzView(APIView):
    """Readiness probe — database reachable."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []

    def get(self, request: Request) -> Response:
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:  # pragma: no cover
            return Response({"status": "error", "detail": str(exc)}, status=503)
        return Response({"status": "ready"})
