from __future__ import annotations

import uuid

from django.db import migrations, models


MENTEE_ROLE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def seed_system_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    db_alias = schema_editor.connection.alias
    Role.objects.using(db_alias).get_or_create(
        id=MENTEE_ROLE_ID,
        defaults={
            "slug": "mentee",
            "name": "Young Believer / Mentee",
            "base_kind": "mentee",
            "is_system": True,
        },
    )
    Role.objects.using(db_alias).get_or_create(
        slug="mentor",
        defaults={"name": "Mentor / Elder", "base_kind": "mentor", "is_system": True},
    )
    Role.objects.using(db_alias).get_or_create(
        slug="admin",
        defaults={"name": "Administrator", "base_kind": "admin", "is_system": True},
    )


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_active_mentees_count_user_age_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Role",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4, editable=False, primary_key=True, serialize=False
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)),
                ("slug", models.SlugField(max_length=100, unique=True)),
                (
                    "base_kind",
                    models.CharField(
                        choices=[
                            ("mentee", "Young Believer / Mentee"),
                            ("mentor", "Mentor / Elder"),
                            ("admin", "Administrator"),
                        ],
                        max_length=16,
                    ),
                ),
                ("capabilities", models.JSONField(blank=True, default=list)),
                ("is_system", models.BooleanField(default=False)),
                ("description", models.TextField(blank=True)),
            ],
            options={"ordering": ("name",), "abstract": False},
        ),
        migrations.RunPython(seed_system_roles, noop),
    ]
