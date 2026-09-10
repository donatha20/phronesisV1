from __future__ import annotations

import pytest

pytestmark = pytest.mark.django_db


def _new_devotion(client):
    return client.post(
        "/api/devotions/",
        {
            "title": "The Spirit of Phronesis",
            "date": "2026-09-11",
            "category_sphere": "personal_growth",
            "reflection_body": "Wisdom rightly applied.",
        },
        format="json",
    )


def test_create_like_and_unlike(api, mentee):
    client = api(mentee)
    did = _new_devotion(client).data["id"]

    liked = client.post(f"/api/devotions/{did}/like/")
    assert liked.status_code == 200
    assert liked.data["likes_count"] == 1
    assert liked.data["is_liked_by_me"] is True

    unliked = client.delete(f"/api/devotions/{did}/like/")
    assert unliked.data["likes_count"] == 0
    assert unliked.data["is_liked_by_me"] is False


def test_comment_persists_and_is_returned(api, mentee, mentor):
    did = _new_devotion(api(mentee)).data["id"]
    posted = api(mentor).post(
        f"/api/devotions/{did}/comments/", {"text": "Amen, this challenged me."}, format="json"
    )
    assert posted.status_code == 201
    assert posted.data["author_name"] == "Thomas"

    listing = api(mentee).get(f"/api/devotions/{did}/comments/")
    texts = [c["text"] for c in listing.data["results"]]
    assert "Amen, this challenged me." in texts

    detail = api(mentee).get(f"/api/devotions/{did}/")
    assert detail.data["comments_count"] == 1


def test_non_author_cannot_edit(api, mentee, other_mentee):
    did = _new_devotion(api(mentee)).data["id"]
    resp = api(other_mentee).patch(f"/api/devotions/{did}/", {"title": "Hijacked"}, format="json")
    assert resp.status_code == 403
