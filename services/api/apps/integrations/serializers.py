from __future__ import annotations

from rest_framework import serializers

from .models import GoogleWorkspaceToken


class GoogleWorkspaceStatusSerializer(serializers.ModelSerializer):
    connected = serializers.SerializerMethodField()

    class Meta:
        model = GoogleWorkspaceToken
        fields = ("connected", "google_account_email", "scopes", "access_token_expiry")

    def get_connected(self, obj: GoogleWorkspaceToken) -> bool:
        return obj.revoked_at is None
