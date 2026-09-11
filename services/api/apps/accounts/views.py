from __future__ import annotations

import secrets
from urllib.parse import urlencode

from dj_rest_auth.jwt_auth import set_jwt_cookies
from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView, PasswordChangeView
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import HttpRequest, HttpResponseRedirect
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from apps.audit.models import AuditAction
from apps.audit.services import record
from apps.common.permissions import IsAdmin
from apps.common.viewsets import AuditedModelViewSet

from .google_oauth import GoogleOAuthError, build_authorization_url, exchange_code_for_identity
from .models import Role, SecuritySettings, UserRole
from .serializers import (
    AdminUserSerializer,
    RoleSerializer,
    SecuritySettingsSerializer,
    UserSerializer,
)

User = get_user_model()

_STATE_COOKIE = "g_oauth_state"
_STATE_COOKIE_PATH = "/api/auth/google/"
_STATE_MAX_AGE = 600  # 10 minutes


# ---------------------------------------------------------------------------
# email / password
# ---------------------------------------------------------------------------
class AuditedLoginView(LoginView):
    """dj-rest-auth login that also writes an audit row (the JWT login path
    never calls ``django.contrib.auth.login()`` so the signal does not fire)."""

    def get_response(self):  # type: ignore[no-untyped-def]
        response = super().get_response()
        if getattr(self, "user", None) and self.user.is_authenticated:
            record(AuditAction.LOGIN, actor=self.user, metadata={"method": "password"})
        return response


class AuditedRegisterView(RegisterView):
    """dj-rest-auth's RegisterView returns the JWT pair in the response body but
    (unlike LoginView) never sets the cookies — so a fresh signup would otherwise
    appear signed-out to a cookie-only client. Set them here, and audit.
    """

    def perform_create(self, serializer):  # type: ignore[no-untyped-def]
        user = super().perform_create(serializer)
        self._created_user = user
        return user

    def create(self, request, *args, **kwargs):  # type: ignore[no-untyped-def]
        response = super().create(request, *args, **kwargs)
        access = getattr(self, "access_token", None)
        refresh = getattr(self, "refresh_token", None)
        if access and refresh:
            set_jwt_cookies(response, access, refresh)
        user = getattr(self, "_created_user", None)
        if user is not None and response.status_code == 201:
            record(AuditAction.REGISTER, actor=user, metadata={"method": "password"})
        return response


class AuditedLogoutView(LogoutView):
    def logout(self, request):  # type: ignore[no-untyped-def]
        user = request.user if request.user.is_authenticated else None
        response = super().logout(request)
        if user is not None:
            record(AuditAction.LOGOUT, actor=user)
        return response


class AuditedPasswordChangeView(PasswordChangeView):
    """Real password change (`POST /api/auth/password/change/`), audited and
    kept in sync with SecuritySettings.last_password_change_at."""

    def post(self, request, *args, **kwargs):  # type: ignore[no-untyped-def]
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and request.user.is_authenticated:
            ss, _ = SecuritySettings.objects.get_or_create(user=request.user)
            ss.last_password_change_at = timezone.now()
            ss.save(update_fields=["last_password_change_at", "updated_at"])
            record(AuditAction.PASSWORD_CHANGE, actor=request.user)
        return response


class MySecuritySettingsView(generics.RetrieveUpdateAPIView):
    """`GET/PATCH /api/auth/security/` — the current user's own settings."""

    serializer_class = SecuritySettingsSerializer

    def get_object(self):  # type: ignore[no-untyped-def]
        obj, _ = SecuritySettings.objects.get_or_create(user=self.request.user)
        return obj


class MentorDirectoryViewSet(
    mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet
):
    """Read-only directory of mentors (`GET /api/mentors/`)."""

    serializer_class = UserSerializer
    queryset = User.objects.filter(role__base_kind=UserRole.MENTOR, is_active=True).order_by(
        "first_name", "last_name"
    )
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["is_verified_elder"]
    search_fields = ["first_name", "last_name", "title", "church_community"]


class RoleViewSet(AuditedModelViewSet):
    """Admin-only role management (`/api/admin/roles/`).

    The three seeded system roles (mentee/mentor/admin) cannot be deleted or
    have their ``slug``/``base_kind`` changed (enforced in
    ``RoleSerializer.validate`` and ``perform_destroy`` below) — every other
    app's RBAC depends on those three ``base_kind`` values always existing.
    """

    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["base_kind", "is_system"]
    search_fields = ["name", "slug"]

    def perform_destroy(self, instance: Role) -> None:  # type: ignore[no-untyped-def]
        if instance.is_system:
            raise PermissionDenied("System roles cannot be deleted.")
        super().perform_destroy(instance)


class AdminUserViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """Admin-only user directory + role assignment.

    `GET /api/admin/users/` to find a user, `PATCH /api/admin/users/{id}/role/`
    to assign one — the only in-app way to change a user's role (previously
    only possible, unaudited, via the Django admin panel).
    """

    queryset = User.objects.select_related("role").order_by("email")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ["role__slug", "is_active"]
    search_fields = ["email", "first_name", "last_name"]

    @action(detail=True, methods=["patch"], url_path="role")
    def role(self, request, pk=None):  # type: ignore[no-untyped-def]
        user = self.get_object()
        role_id = request.data.get("role_id")
        if not role_id:
            raise ValidationError({"role_id": "This field is required."})
        try:
            new_role = Role.objects.get(pk=role_id)
        except (Role.DoesNotExist, ValueError, TypeError, DjangoValidationError):
            raise ValidationError({"role_id": "No role matches this id."}) from None

        old_role = user.role
        if old_role.pk != new_role.pk:
            user.role = new_role
            user.save(update_fields=["role"])
            record(
                AuditAction.ROLE_CHANGE,
                actor=request.user,
                target=user,
                metadata={"old_role": old_role.slug, "new_role": new_role.slug},
            )
        return Response(AdminUserSerializer(user).data, status=status.HTTP_200_OK)


@require_GET
@ensure_csrf_cookie
def csrf_view(request: HttpRequest):
    """Frontend calls this once on load to obtain the ``csrftoken`` cookie
    before issuing unsafe requests against the cookie-JWT API."""
    from django.http import JsonResponse

    return JsonResponse({"detail": "CSRF cookie set"})


# ---------------------------------------------------------------------------
# Login with Google — full-page redirect (authorization-code flow)
# ---------------------------------------------------------------------------
def _frontend_redirect(path: str, **params: str) -> HttpResponseRedirect:
    url = settings.FRONTEND_URL.rstrip("/") + path
    if params:
        url = f"{url}?{urlencode(params)}"
    return HttpResponseRedirect(url)


@require_GET
def google_authorize_view(request: HttpRequest):
    """Step 1: send the browser to Google's consent screen."""
    try:
        auth_url, state = build_authorization_url()
    except GoogleOAuthError as exc:
        return _frontend_redirect("/login", error=exc.code)

    response = HttpResponseRedirect(auth_url)
    response.set_cookie(
        _STATE_COOKIE,
        state,
        max_age=_STATE_MAX_AGE,
        path=_STATE_COOKIE_PATH,
        secure=not settings.DEBUG,
        httponly=True,
        samesite="Lax",
    )
    return response


@require_GET
def google_callback_view(request: HttpRequest):
    """Step 2: Google redirects back here with ``code`` + ``state``. We verify,
    upsert the user, set JWT cookies, and bounce to the SPA callback route."""
    def _fail(code: str) -> HttpResponseRedirect:
        record(AuditAction.LOGIN_FAILED, metadata={"method": "google", "reason": code})
        resp = _frontend_redirect("/login", error=code)
        resp.delete_cookie(_STATE_COOKIE, path=_STATE_COOKIE_PATH)
        return resp

    if request.GET.get("error"):
        return _fail(request.GET["error"])  # e.g. access_denied

    code = request.GET.get("code", "")
    state = request.GET.get("state", "")
    expected_state = request.COOKIES.get(_STATE_COOKIE, "")
    if not code or not state or not expected_state or not secrets.compare_digest(state, expected_state):
        return _fail("state_mismatch")

    try:
        identity = exchange_code_for_identity(code=code, state=state)
    except GoogleOAuthError as exc:
        return _fail(exc.code)

    user, created = User.objects.get_or_create(
        email=identity.email,
        defaults={
            "first_name": identity.given_name,
            "last_name": identity.family_name,
            "role": Role.resolve(UserRole.MENTEE),
        },
    )
    if not user.is_active:
        return _fail("account_disabled")
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
        record(AuditAction.REGISTER, actor=user, metadata={"method": "google"})

    update_last_login(None, user)
    record(AuditAction.LOGIN, actor=user, metadata={"method": "google", "new_account": created})

    refresh = RefreshToken.for_user(user)
    response = _frontend_redirect(
        "/auth/callback",
        status="success",
        new="1" if (created or not user.profile_completed) else "0",
    )
    set_jwt_cookies(response, str(refresh.access_token), str(refresh))
    response.delete_cookie(_STATE_COOKIE, path=_STATE_COOKIE_PATH)
    # touch security settings row
    SecuritySettings.objects.get_or_create(user=user, defaults={"last_password_change_at": timezone.now()})
    return response
