from __future__ import annotations

from django.urls import path

from .views import HealthzView, ReadyzView

urlpatterns = [
    path("", HealthzView.as_view(), name="healthz"),
    path("ready/", ReadyzView.as_view(), name="readyz"),
]
