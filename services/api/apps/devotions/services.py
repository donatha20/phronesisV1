from __future__ import annotations

import datetime as dt

from .models import DevotionReadLog


def compute_streak_days(user) -> int:  # type: ignore[no-untyped-def]
    """Consecutive calendar days (ending today or yesterday, so a streak
    doesn't reset the instant the clock ticks past midnight before the user
    has read today's devotion) with at least one read-log row."""
    read_dates = set(
        DevotionReadLog.objects.filter(user=user).values_list("created_at__date", flat=True)
    )
    if not read_dates:
        return 0

    today = dt.date.today()
    anchor = today if today in read_dates else today - dt.timedelta(days=1)
    if anchor not in read_dates:
        return 0

    streak = 0
    cursor = anchor
    while cursor in read_dates:
        streak += 1
        cursor -= dt.timedelta(days=1)
    return streak
