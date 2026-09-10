from __future__ import annotations

import pytest

from apps.resources.models import Resource

pytestmark = pytest.mark.django_db


def test_elders_only_hidden_from_mentee_visible_to_mentor(api, mentee, mentor):
    r = Resource.objects.create(
        title="Eldership Notes", type="sermon_transcript", sphere="ministry",
        access_tier="elders_only", uploaded_by=mentor,
    )
    assert api(mentee).get(f"/api/resources/{r.id}/").status_code == 404
    assert api(mentor).get(f"/api/resources/{r.id}/").status_code == 200


def test_enrolled_cohort_visible_after_enroll(api, mentee, mentor):
    r = Resource.objects.create(
        title="Cohort Study", type="study_series", sphere="personal_growth",
        access_tier="enrolled_cohort", uploaded_by=mentor,
    )
    assert api(mentee).get(f"/api/resources/{r.id}/").status_code == 404
    # enroll endpoint still resolves the object via unrestricted get_object? No:
    # queryset excludes it, so enroll 404s too. Enrollment is granted by a mentor/flow.
    from apps.resources.models import ResourceEnrollment

    ResourceEnrollment.objects.create(resource=r, user=mentee)
    got = api(mentee).get(f"/api/resources/{r.id}/")
    assert got.status_code == 200
    assert got.data["is_enrolled"] is True


def test_mentee_cannot_create_resource(api, mentee):
    resp = api(mentee).post(
        "/api/resources/",
        {"title": "x", "type": "pdf_guide", "sphere": "finances"},
        format="json",
    )
    assert resp.status_code == 403


def test_episode_like_and_view_count(api, mentee, mentor):
    eid = api(mentor).post(
        "/api/episodes/",
        {"title": "Vocation as Worship", "media_type": "audio", "sphere": "academia_career",
         "duration_seconds": 1980},
        format="json",
    ).data["id"]

    liked = api(mentee).post(f"/api/episodes/{eid}/like/")
    assert liked.data["likes_count"] == 1

    first = api(mentee).get(f"/api/episodes/{eid}/").data["views_count"]
    second = api(mentee).get(f"/api/episodes/{eid}/").data["views_count"]
    assert second == first + 1
