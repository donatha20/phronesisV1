from __future__ import annotations

from rest_framework.routers import DefaultRouter

from apps.accounts.views import (
    AdminUserViewSet,
    MenteeDirectoryViewSet,
    MentorDirectoryViewSet,
    RoleViewSet,
)
from apps.devotions.views import DevotionViewSet
from apps.goals.views import GoalViewSet
from apps.media.views import PodcastEpisodeViewSet
from apps.mentorship.views import MentorshipApplicationViewSet, MentorshipViewSet
from apps.prayers.views import PrayerRequestViewSet
from apps.resources.views import ResourceViewSet
from apps.sessions.views import DiscipleshipSessionViewSet

router = DefaultRouter()
router.register("mentors", MentorDirectoryViewSet, basename="mentor")
router.register("mentees", MenteeDirectoryViewSet, basename="mentee")
router.register("admin/roles", RoleViewSet, basename="admin-role")
router.register("admin/users", AdminUserViewSet, basename="admin-user")
router.register("mentorship-applications", MentorshipApplicationViewSet, basename="mentorship-application")
router.register("mentorships", MentorshipViewSet, basename="mentorship")
router.register("goals", GoalViewSet, basename="goal")
router.register("devotions", DevotionViewSet, basename="devotion")
router.register("episodes", PodcastEpisodeViewSet, basename="episode")
router.register("sessions", DiscipleshipSessionViewSet, basename="session")
router.register("prayers", PrayerRequestViewSet, basename="prayer")
router.register("resources", ResourceViewSet, basename="resource")

urlpatterns = router.urls
