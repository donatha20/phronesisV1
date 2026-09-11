from __future__ import annotations

import uuid

import django.db.models.deletion
from django.db import migrations, models

MENTEE_ROLE_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")


def map_role_strings_to_fk(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    Role = apps.get_model("accounts", "Role")
    db_alias = schema_editor.connection.alias
    role_ids_by_slug = {r.slug: r.id for r in Role.objects.using(db_alias).all()}
    for user in User.objects.using(db_alias).all():
        new_role_id = role_ids_by_slug.get(user.role_old)
        if new_role_id:
            user.role_id = new_role_id
            user.save(using=db_alias, update_fields=["role"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0003_role"),
    ]

    operations = [
        migrations.RenameField(model_name="user", old_name="role", new_name="role_old"),
        migrations.AddField(
            model_name="user",
            name="role",
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="users",
                to="accounts.role",
            ),
        ),
        migrations.RunPython(map_role_strings_to_fk, noop),
        migrations.RemoveField(model_name="user", name="role_old"),
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.ForeignKey(
                default=MENTEE_ROLE_ID,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="users",
                to="accounts.role",
            ),
        ),
    ]
