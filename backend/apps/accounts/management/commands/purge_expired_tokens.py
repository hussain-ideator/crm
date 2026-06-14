from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import RefreshTokenFamily, RefreshTokenLineage


class Command(BaseCommand):
    help = "Delete expired RefreshTokenLineage rows, then orphaned RefreshTokenFamily rows."

    def handle(self, *args, **options):
        now = timezone.now()

        lineage_result = RefreshTokenLineage.objects.filter(expires_at__lt=now).delete()
        lineage_count = lineage_result[0]

        family_result = RefreshTokenFamily.objects.filter(lineage__isnull=True).delete()
        family_count = family_result[0]

        self.stdout.write(
            f"Purged {lineage_count} expired lineage record(s) "
            f"and {family_count} orphaned family record(s)."
        )
