from django.db import migrations

STAGES = [
    {"name": "Qualification", "order_index": 1, "probability": 10, "is_won": False, "is_lost": False},
    {"name": "Needs Analysis", "order_index": 2, "probability": 25, "is_won": False, "is_lost": False},
    {"name": "Proposal",       "order_index": 3, "probability": 50, "is_won": False, "is_lost": False},
    {"name": "Negotiation",    "order_index": 4, "probability": 75, "is_won": False, "is_lost": False},
    {"name": "Closed Won",     "order_index": 5, "probability": 100, "is_won": True, "is_lost": False},
    {"name": "Closed Lost",    "order_index": 6, "probability": 0,  "is_won": False, "is_lost": True},
]


def seed_pipeline(apps, schema_editor):
    Pipeline = apps.get_model("deals", "Pipeline")
    Stage = apps.get_model("deals", "Stage")

    pipeline, _ = Pipeline.objects.get_or_create(
        name="Sales Pipeline",
        defaults={"is_default": True},
    )
    for stage_data in STAGES:
        Stage.objects.get_or_create(
            pipeline=pipeline,
            order_index=stage_data["order_index"],
            defaults={
                "name": stage_data["name"],
                "probability": stage_data["probability"],
                "is_won": stage_data["is_won"],
                "is_lost": stage_data["is_lost"],
            },
        )


def unseed_pipeline(apps, schema_editor):
    Pipeline = apps.get_model("deals", "Pipeline")
    Pipeline.objects.filter(name="Sales Pipeline").delete()


class Migration(migrations.Migration):

    dependencies = [
        ("deals", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_pipeline, unseed_pipeline),
    ]
