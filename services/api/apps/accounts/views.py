from __future__ import annotations

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import LoginView, LogoutView
from django.conf import settings

from apps.audit.models import AuditAction
from apps.audit.services import record


class AuditedLoginView(LoginView):
    """dj-rest-auth login that also writes an audit row.

    The JWT login path does not call ``django.contrib.auth.login()``, so the
    ``user_logged_in`` signal never fires — we record the event explicitly here.
    """

    def get_response(self):  # type: ignore[no-untyped-def]
        response = super().get_response()
        if getattr(self, "user", None) and self.user.is_authenticated:
            record(AuditAction.LOGIN, actor=self.user, metadata={"method": "password"})
        return response


class AuditedLogoutView(LogoutView):
    def logout(self, request):  # type: ignore[no-untyped-def]
        user = request.user if request.user.is_authenticated else None
        response = super().logout(request)
        if user is not None:
            record(AuditAction.LOGOUT, actor=user)
        return response


class GoogleLoginView(SocialLoginView):
    """`POST /api/auth/google/` — "Login with Google" option.

    Accepts either an ``access_token`` or an authorization ``code`` from the
    web client, verifies it with Google, creates/links the local user, and
    returns the same JWT cookie pair as email/password login.

    Scopes are limited to ``openid email profile`` (see SOCIALACCOUNT_PROVIDERS).
    This is *identity only* — Drive/Calendar/Meet access is a separate flow under
    ``/api/integrations/google/``.
    """

    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client

    @property
    def callback_url(self) -> str:
        return f"{settings.CORS_ALLOWED_ORIGINS[0]}/auth/google/callback"
