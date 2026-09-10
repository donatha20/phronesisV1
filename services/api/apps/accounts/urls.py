from __future__ import annotations

from django.urls import path

from .views import AuditedLoginView, AuditedLogoutView, GoogleLoginView

urlpatterns = [
    path("login/", AuditedLoginView.as_view(), name="rest_login"),
    path("logout/", AuditedLogoutView.as_view(), name="rest_logout"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
]
