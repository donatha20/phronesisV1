from __future__ import annotations

import datetime as dt

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.mentorship.models import Mentorship

User = get_user_model()


@pytest.fixture
def make_user(db):  # noqa: ARG001
    def _make(email: str, role: str = "mentee", password: str = "a-strong-pass-1", **extra):
        return User.objects.create_user(email=email, password=password, role=role, **extra)

    return _make


@pytest.fixture
def mentee(make_user):
    return make_user("mentee@example.com", "mentee", first_name="Joshua")


@pytest.fixture
def other_mentee(make_user):
    return make_user("other@example.com", "mentee", first_name="Ruth")


@pytest.fixture
def mentor(make_user):
    return make_user("mentor@example.com", "mentor", first_name="Thomas")


@pytest.fixture
def other_mentor(make_user):
    return make_user("mentor2@example.com", "mentor", first_name="Deborah")


@pytest.fixture
def admin_user(make_user):
    return make_user("admin@example.com", "admin", is_staff=True)


@pytest.fixture
def pairing(mentee, mentor):
    return Mentorship.objects.create(
        mentee=mentee, mentor=mentor, is_active=True, paired_at=timezone.now().date()
    )


@pytest.fixture
def api():
    def _client(user=None):
        c = APIClient()
        if user is not None:
            c.force_authenticate(user)
        return c

    return _client


@pytest.fixture
def soon():
    return (timezone.now() + dt.timedelta(days=2)).isoformat()
