# Generated by Django 5.0.2 on 2024-02-27 00:02

from django.db import migrations

import sentry.db.models.fields.bounded
from sentry.new_migrations.migrations import CheckedMigration


class Migration(CheckedMigration):
    # This flag is used to mark that a migration shouldn't be automatically run in production. For
    # the most part, this should only be used for operations where it's safe to run the migration
    # after your code has deployed. So this should not be used for most operations that alter the
    # schema of a table.
    # Here are some things that make sense to mark as post deployment:
    # - Large data migrations. Typically we want these to be run manually by ops so that they can
    #   be monitored and not block the deploy for a long period of time while they run.
    # - Adding indexes to large tables. Since this can take a long time, we'd generally prefer to
    #   have ops run this and not block the deploy. Note that while adding an index is a schema
    #   change, it's completely safe to run the operation after the code has deployed.
    is_post_deployment = False

    dependencies = [
        ("sentry", "0656_add_discover_dataset_split_dashboard"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    """
                    ALTER TABLE "sentry_alertruletriggeraction" ADD COLUMN "status" integer NOT NULL DEFAULT 0;
                    """,
                    reverse_sql="""
                    ALTER TABLE "sentry_alertruletriggeraction" DROP COLUMN "status";
                    """,
                    hints={"tables": ["sentry_alertruletriggeraction"]},
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="alertruletriggeraction",
                    name="status",
                    field=sentry.db.models.fields.bounded.BoundedPositiveIntegerField(default=0),
                ),
            ],
        )
    ]
