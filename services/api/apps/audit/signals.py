from __future__ import annotations

from typing import Any

from django.contrib.auth.signals import (
    user_logged_in,
    user_logged_out,
    user_login_failed,
)
from django.dispatch import receiver

from .models import AuditAction
from .services import record


@receiver(user_logged_in)
def _on_login(sender: Any, request: Any, user: Any, **kwargs: Any) -> None:
    record(AuditAction.LOGIN, actor=user)


@receiver(user_logged_out)
def _on_logout(sender: Any, request: Any, user: Any, **kwargs: Any) -> None:
    record(AuditAction.LOGOUT, actor=user)


@receiver(user_login_failed)
def _on_login_failed(sender: Any, credentials: dict, request: Any, **kwargs: Any) -> None:
    record(
        AuditAction.LOGIN_FAILED,
        metadata={"email": credentials.get("username") or credentials.get("email", "")},
    )
