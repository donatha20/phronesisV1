from __future__ import annotations

from typing import Any

from django.db import models

from .middleware import get_client_ip, get_current_request
from .models import AuditLog


def record(
    action: str,
    *,
    actor: Any | None = None,
    target: models.Model | None = None,
    target_type: str = "",
    target_id: str = "",
    metadata: dict[str, Any] | None = None,
) -> AuditLog:
    """Write one append-only audit row.

    ``actor`` / IP / user-agent fall back to the current request when omitted,
    so most call sites only need ``record(AuditAction.PRAYER_VIEW, target=obj)``.
    """
    request = get_current_request()
    if actor is None and request is not None:
        candidate = getattr(request, "user", None)
        if candidate is not None and getattr(candidate, "is_authenticated", False):
            actor = candidate

    if target is not None:
        target_type = target_type or target._meta.label_lower
        target_id = target_id or str(target.pk)

    return AuditLog.objects.create(
        actor=actor if actor and getattr(actor, "pk", None) else None,
        actor_email=getattr(actor, "email", "") or "",
        action=action,
        target_type=target_type,
        target_id=target_id,
        ip_address=get_client_ip(request),
        user_agent=(request.META.get("HTTP_USER_AGENT", "")[:400] if request else ""),
        metadata=metadata or {},
    )
