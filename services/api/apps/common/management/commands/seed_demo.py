"""Populate the database with demo content for local/staging use.

Ported (abridged) from the old client fixture ``apps/web/src/data/sampleData.ts``.
Refuses to run when ``DEBUG`` is False unless ``--force`` is given, and never
touches an environment named 'production'.
"""
from __future__ import annotations

import datetime as dt
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from apps.accounts.models import Role, SecuritySettings, User
from apps.common.choices import LifeSphere, UserRole
from apps.devotions.models import Devotion
from apps.goals.models import Goal, GoalStatus, Milestone
from apps.media.models import MediaType, PodcastEpisode
from apps.mentorship.models import Mentorship
from apps.prayers.models import PrayerPrivacy, PrayerRequest
from apps.resources.models import Resource, ResourceType
from apps.sessions.models import DiscipleshipSession, SessionPlatform, SessionStatus

DEMO_PASSWORD = "demo-pass-phronesis-1"  # noqa: S105 - local demo only


class Command(BaseCommand):
    help = "Seed demo users and content (non-production only)."

    def add_arguments(self, parser: Any) -> None:
        parser.add_argument("--force", action="store_true", help="Run even if DEBUG is False.")
        parser.add_argument("--flush-demo", action="store_true",
                            help="Delete existing @demo.phronesis.local users first.")

    @transaction.atomic
    def handle(self, *args: Any, **opts: Any) -> None:
        env_name = getattr(settings, "SENTRY_ENVIRONMENT", "") or ""
        if env_name.lower() == "production" or (not settings.DEBUG and not opts["force"]):
            raise CommandError("Refusing to seed demo data in this environment (use --force to override).")

        if opts["flush_demo"]:
            User.objects.filter(email__endswith="@demo.phronesis.local").delete()
            self.stdout.write("Deleted existing demo users.")

        mentor = self._user("thomas@demo.phronesis.local", "Thomas", "Bradley", UserRole.MENTOR,
                            title="Elder & Vocational Discipleship Mentor", is_verified_elder=True,
                            years_in_faith=32, primary_spheres=[LifeSphere.ACADEMIA_CAREER, LifeSphere.FINANCES])
        mentee = self._user("joshua@demo.phronesis.local", "Joshua", "Miller", UserRole.MENTEE,
                            title="Young Believer", years_in_faith=3,
                            focus_spheres=[LifeSphere.PERSONAL_GROWTH, LifeSphere.RELATIONSHIPS])
        admin = self._user("admin@demo.phronesis.local", "Deborah", "Vance", UserRole.ADMIN,
                           title="Community Steward", is_staff=True)

        Mentorship.objects.get_or_create(
            mentee=mentee, mentor=mentor, is_active=True,
            defaults={"paired_at": timezone.now().date() - dt.timedelta(days=40)},
        )

        goal, created = Goal.objects.get_or_create(
            assigned_to=mentee, title="Establish a daily Scripture rhythm",
            defaults=dict(
                created_by=mentee, sphere=LifeSphere.PERSONAL_GROWTH,
                description="Read and journal through the Gospel of John before the workday.",
                scripture_anchor="John 15:4-5", status=GoalStatus.ACTIVE,
                check_in_frequency="Weekly", progress_percent=40, mentor_approved=True,
                target_date=timezone.now().date() + dt.timedelta(days=60),
            ),
        )
        if created:
            for i, title in enumerate(["Choose a fixed morning time", "Finish John 1-7",
                                       "Finish John 8-14", "Finish John 15-21"]):
                Milestone.objects.create(goal=goal, title=title, order=i, is_completed=i == 0)
            goal.recompute_progress()
            goal.save(update_fields=["progress_percent"])

        Devotion.objects.get_or_create(
            title="The Spirit of Phronesis", date=timezone.now().date(),
            defaults=dict(
                author=mentor, author_title="Elder Mentor", theme="Practical wisdom",
                category_sphere=LifeSphere.PERSONAL_GROWTH,
                scripture_reference="James 1:5",
                scripture_text="If any of you lacks wisdom, let him ask God...",
                reflection_body="Wisdom is not merely knowledge; it is knowledge rightly applied.",
                prayer_point="Father, impart your practical discernment for today's decisions.",
                practical_action_step="Name one decision today you will bring to prayer before acting.",
                read_time_minutes=4, tags=["wisdom", "discernment"],
            ),
        )

        PrayerRequest.objects.get_or_create(
            author=mentee, title="Clarity on internship offer",
            defaults=dict(
                prayer_need="Deciding between two roles; asking for peace and clear direction.",
                category_sphere=LifeSphere.ACADEMIA_CAREER,
                privacy_level=PrayerPrivacy.MENTOR_ONLY, tags=["career", "guidance"],
            ),
        )

        Resource.objects.get_or_create(
            title="A Field Guide to Financial Stewardship",
            defaults=dict(
                author="Thomas Bradley", type=ResourceType.PDF_GUIDE, sphere=LifeSphere.FINANCES,
                description="Six sessions on budgeting, generosity, and debt as a disciple.",
                read_time="45 min", rating=4.8, uploaded_by=mentor,
                key_scripture_anchors=["Proverbs 3:9-10", "2 Corinthians 9:7"],
            ),
        )

        PodcastEpisode.objects.get_or_create(
            title="Vocation as Worship",
            defaults=dict(
                series="Phronesis Discipleship Series", speaker="Thomas Bradley",
                speaker_role="Elder Mentor", media_type=MediaType.AUDIO, duration_seconds=1980,
                release_date=timezone.now().date() - dt.timedelta(days=7),
                sphere=LifeSphere.ACADEMIA_CAREER,
                description="How ordinary work becomes an offering.",
                key_scriptures=["Colossians 3:23"], key_takeaways=["Excellence is a form of love"],
            ),
        )

        DiscipleshipSession.objects.get_or_create(
            mentee=mentee, mentor=mentor,
            scheduled_at=timezone.now() + dt.timedelta(days=2, hours=1),
            defaults=dict(
                duration_minutes=45, sphere_focus=LifeSphere.PERSONAL_GROWTH,
                topic="Reviewing the Scripture rhythm goal", platform=SessionPlatform.GOOGLE_MEET,
                status=SessionStatus.SCHEDULED,
                scripture_text="John 15:4-5", action_items=["Bring journal notes from John 1-7"],
            ),
        )

        self.stdout.write(self.style.SUCCESS(
            f"Seeded demo data. Users: {mentor.email}, {mentee.email}, {admin.email} "
            f"(password: {DEMO_PASSWORD})"
        ))

    def _user(self, email: str, first: str, last: str, role: str, **extra: Any) -> User:
        user, created = User.objects.get_or_create(
            email=email,
            defaults=dict(first_name=first, last_name=last, role=Role.resolve(role),
                          profile_completed=True, **extra),
        )
        if created:
            user.set_password(DEMO_PASSWORD)
            user.save()
            SecuritySettings.objects.get_or_create(user=user)
        return user
