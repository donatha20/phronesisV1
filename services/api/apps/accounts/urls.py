from __future__ import annotations

from django.urls import path

from .views import (
    AuditedLoginView,
    AuditedLogoutView,
    csrf_view,
    google_authorize_view,
    google_callback_view,
)

urlpatterns = [
    path("csrf/", csrf_view, name="csrf"),
    path("login/", AuditedLoginView.as_view(), name="rest_login"),
    path("logout/", AuditedLogoutView.as_view(), name="rest_logout"),
    # Login with Google — full-page redirect (authorization-code flow)
    path("google/authorize/", google_authorize_view, name="google_authorize"),
    path("google/callback", google_callback_view, name="google_callback"),
]
