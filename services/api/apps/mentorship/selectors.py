from __future__ import annotations

from django.db.models import Q, QuerySet

from .models import Mentorship


def active_mentee_ids_for(mentor) -> QuerySet:  # type: ignore[no-untyped-def]
    return Mentorship.objects.filter(mentor=mentor, is_active=True).values_list(
        "mentee_id", flat=True
    )


def active_mentor_for(mentee):  # type: ignore[no-untyped-def]
    link = (
        Mentorship.objects.filter(mentee=mentee, is_active=True)
        .select_related("mentor")
        .first()
    )
    return link.mentor if link else None


def are_paired(user_a, user_b) -> bool:  # type: ignore[no-untyped-def]
    return (
        Mentorship.objects.filter(is_active=True)
        .filter(Q(mentee=user_a, mentor=user_b) | Q(mentee=user_b, mentor=user_a))
        .exists()
    )
