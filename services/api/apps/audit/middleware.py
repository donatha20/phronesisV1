"""Thread-local access to the current request so the audit service can attach
the acting user and client IP without threading ``request`` through every call.
"""
from __future__ import annotations

import threading
from collections.abc import Callable

from django.http import HttpRequest, HttpResponse

_state = threading.local()


def get_current_request() -> HttpRequest | None:
    return getattr(_state, "request", None)


def get_client_ip(request: HttpRequest | None) -> str | None:
    if request is None:
        return None
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class CurrentRequestMiddleware:
    def __init__(self, get_response: Callable[[HttpRequest], HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        _state.request = request
        try:
            return self.get_response(request)
        finally:
            _state.request = None
