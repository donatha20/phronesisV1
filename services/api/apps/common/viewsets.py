from __future__ import annotations

from rest_framework import viewsets

from apps.audit.models import AuditAction
from apps.audit.services import record


class AuditedModelViewSet(viewsets.ModelViewSet):
    """ModelViewSet that writes an audit row on every create/update/destroy.

    Override ``audit_actions`` to use a domain-specific taxonomy, e.g.::

        audit_actions = {
            "create": AuditAction.PRAYER_CREATE,
            "update": AuditAction.PRAYER_UPDATE,
            "destroy": AuditAction.PRAYER_DELETE,
        }
    """

    audit_actions: dict[str, str] = {
        "create": AuditAction.CREATE,
        "update": AuditAction.UPDATE,
        "destroy": AuditAction.DELETE,
    }

    def _audit(self, key: str, instance) -> None:  # type: ignore[no-untyped-def]
        action = self.audit_actions.get(key)
        if action:
            record(action, target=instance)

    def perform_create(self, serializer):  # type: ignore[no-untyped-def]
        instance = serializer.save()
        self._audit("create", instance)

    def perform_update(self, serializer):  # type: ignore[no-untyped-def]
        instance = serializer.save()
        self._audit("update", instance)

    def perform_destroy(self, instance):  # type: ignore[no-untyped-def]
        self._audit("destroy", instance)
        instance.delete()
