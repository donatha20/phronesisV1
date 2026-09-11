from __future__ import annotations

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

api_patterns = [
    # auth: our audited login/logout + "Login with Google" (must precede dj_rest_auth)
    path("auth/", include("apps.accounts.urls")),
    # auth: remaining email/password + JWT endpoints (password reset, token refresh, /user/)
    path("auth/", include("dj_rest_auth.urls")),
    path("auth/registration/", include("dj_rest_auth.registration.urls")),
    # health
    path("healthz/", include("apps.common.urls")),
    # Google Workspace broker (Drive/Calendar/Meet) — separate from login
    path("integrations/", include("apps.integrations.urls")),
    # domain REST API
    path("", include("config.api_router")),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include((api_patterns, "api"))),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
