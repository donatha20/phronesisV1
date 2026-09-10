from __future__ import annotations

from rest_framework.permissions import SAFE_METHODS, BasePermission

MENTOR = "mentor"
ADMIN = "admin"
MENTEE = "mentee"


def is_admin(user) -> bool:  # type: ignore[no-untyped-def]
    return bool(user and user.is_authenticated and (user.role == ADMIN or user.is_staff))


def is_mentor(user) -> bool:  # type: ignore[no-untyped-def]
    return bool(user and user.is_authenticated and user.role == MENTOR)


class IsAuthenticatedAndActive(BasePermission):
    def has_permission(self, request, view) -> bool:  # type: ignore[no-untyped-def]
        u = request.user
        return bool(u and u.is_authenticated and u.is_active)


class ReadOnlyOrMentor(BasePermission):
    """Anyone authenticated may read; only mentors/admins may write."""

    def has_permission(self, request, view) -> bool:  # type: ignore[no-untyped-def]
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return is_mentor(request.user) or is_admin(request.user)


class IsOwnerOrReadOnly(BasePermission):
    """Object-level: safe methods for any authed user, writes only for the owner.

    The owner attribute name is read from ``view.owner_field`` (default ``author``).
    """

    def has_object_permission(self, request, view, obj) -> bool:  # type: ignore[no-untyped-def]
        if request.method in SAFE_METHODS:
            return True
        if is_admin(request.user):
            return True
        owner_field = getattr(view, "owner_field", "author")
        owner = getattr(obj, owner_field, None)
        return owner == request.user


class IsOwnerOnly(BasePermission):
    """Object-level: only the owner (or admin) may read or write."""

    def has_object_permission(self, request, view, obj) -> bool:  # type: ignore[no-untyped-def]
        if is_admin(request.user):
            return True
        owner_field = getattr(view, "owner_field", "author")
        return getattr(obj, owner_field, None) == request.user
