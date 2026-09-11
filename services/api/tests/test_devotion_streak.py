from __future__ import annotations

import datetime as dt

import pytest
from django.utils import timezone

from apps.devotions.models import Devotion, DevotionReadLog
from apps.devotions.services import compute_streak_days

pytestmark = pytest.mark.django_db


def _devotion(mentor, date):
    return Devotion.objects.create(
        title=f"Devotion {date}", date=date, category_sphere="personal_growth", author=mentor,
    )


def test_streak_zero_with_no_reads(mentee):
    assert compute_streak_days(mentee) == 0


def test_streak_counts_consecutive_days_ending_today(mentee, mentor):
    today = timezone.now().date()
    for offset in range(3):  # today, yesterday, day before
        d = _devotion(mentor, today - dt.timedelta(days=offset))
        log = DevotionReadLog.objects.create(devotion=d, user=mentee)
        log.created_at = timezone.now() - dt.timedelta(days=offset)
        log.save(update_fields=["created_at"])

    assert compute_streak_days(mentee) == 3


def test_streak_still_counts_if_today_not_yet_read(mentee, mentor):
    """Reading yesterday but not yet today shouldn't zero the streak out —
    only a real gap (2+ days) should."""
    yesterday = timezone.now().date() - dt.timedelta(days=1)
    d = _devotion(mentor, yesterday)
    log = DevotionReadLog.objects.create(devotion=d, user=mentee)
    log.created_at = timezone.now() - dt.timedelta(days=1)
    log.save(update_fields=["created_at"])

    assert compute_streak_days(mentee) == 1


def test_streak_broken_by_a_gap(mentee, mentor):
    today = timezone.now().date()
    d1 = _devotion(mentor, today)
    DevotionReadLog.objects.create(devotion=d1, user=mentee)

    old_date = today - dt.timedelta(days=5)
    d2 = _devotion(mentor, old_date)
    log = DevotionReadLog.objects.create(devotion=d2, user=mentee)
    log.created_at = timezone.now() - dt.timedelta(days=5)
    log.save(update_fields=["created_at"])

    assert compute_streak_days(mentee) == 1


def test_mark_read_endpoint_is_idempotent_and_feeds_streak(api, mentee, mentor):
    devotion = _devotion(mentor, timezone.now().date())
    client = api(mentee)

    resp = client.post(f"/api/devotions/{devotion.id}/mark_read/")
    assert resp.status_code == 204
    resp2 = client.post(f"/api/devotions/{devotion.id}/mark_read/")
    assert resp2.status_code == 204
    assert DevotionReadLog.objects.filter(devotion=devotion, user=mentee).count() == 1

    me = client.get("/api/auth/user/")
    assert me.data["devotion_streak_days"] == 1


def test_devotion_streak_not_exposed_for_other_users(api, mentee, mentor):
    devotion = _devotion(mentor, timezone.now().date())
    DevotionReadLog.objects.create(devotion=devotion, user=mentor)

    # mentee looks up mentor via the directory — should not see mentor's streak
    resp = api(mentee).get("/api/mentors/")
    assert resp.status_code == 200
    rows = resp.data["results"] if "results" in resp.data else resp.data
    mentor_row = next(r for r in rows if r["id"] == str(mentor.id))
    assert mentor_row["devotion_streak_days"] == 0
