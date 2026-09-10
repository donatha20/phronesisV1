from __future__ import annotations

from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRole(models.TextChoices):
    MENTEE = "mentee", _("Young Believer / Mentee")
    MENTOR = "mentor", _("Mentor / Elder")
    ADMIN = "admin", _("Administrator")


class LifeSphere(models.TextChoices):
    """The five life spheres. Values mirror the client enum in ``apps/web/src/types.ts``."""

    PERSONAL_GROWTH = "personal_growth", _("Personal Growth")
    ACADEMIA_CAREER = "academia_career", _("Academia & Career")
    RELATIONSHIPS = "relationships", _("Relationships")
    FINANCES = "finances", _("Finances")
    PHYSICAL_WELLBEING = "physical_wellbeing", _("Physical Wellbeing")
