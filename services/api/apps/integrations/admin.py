from __future__ import annotations

from django.contrib import admin

from .models import GoogleWorkspaceToken


@admin.register(GoogleWorkspaceToken)
class GoogleWorkspaceTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "google_account_email", "access_token_expiry", "revoked_at")
    search_fields = ("user__email", "google_account_email")
    readonly_fields = ("scopes", "access_token_expiry", "google_account_email")
    exclude = ("encrypted_refresh_token",)  # never render the secret

    def has_add_permission(self, request) -> bool:  # type: ignore[no-untyped-def]
        return False
