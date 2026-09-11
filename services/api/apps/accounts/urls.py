from __future__ import annotations

from django.urls import path

from .views import (
    AuditedLoginView,
    AuditedLogoutView,
    AuditedPasswordChangeView,
    AuditedRegisterView,
    MySecuritySettingsView,
    csrf_view,
    google_authorize_view,
    google_callback_view,
)

urlpatterns = [
    path("csrf/", csrf_view, name="csrf"),
    path("login/", AuditedLoginView.as_view(), name="rest_login"),
    path("logout/", AuditedLogoutView.as_view(), name="rest_logout"),
    path("registration/", AuditedRegisterView.as_view(), name="rest_register"),
    path("password/change/", AuditedPasswordChangeView.as_view(), name="rest_password_change"),
    path("security/", MySecuritySettingsView.as_view(), name="my_security_settings"),
    # Login with Google — full-page redirect (authorization-code flow)
    path("google/authorize/", google_authorize_view, name="google_authorize"),
    path("google/callback", google_callback_view, name="google_callback"),
]
