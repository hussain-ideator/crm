from django.db import migrations


def seed_lead_sources(apps, schema_editor):
    LeadSource = apps.get_model("leads", "LeadSource")
    for name in ["Web", "Referral", "Cold Call", "Email", "Social Media"]:
        LeadSource.objects.get_or_create(name=name)


def unseed_lead_sources(apps, schema_editor):
    LeadSource = apps.get_model("leads", "LeadSource")
    LeadSource.objects.filter(
        name__in=["Web", "Referral", "Cold Call", "Email", "Social Media"]
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("leads", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_lead_sources, unseed_lead_sources),
    ]
