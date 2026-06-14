from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteMixin, TimestampedModel


class Contact(TimestampedModel, SoftDeleteMixin):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=254, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    title = models.CharField(max_length=150, blank=True, default="")
    company_fk = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contacts",
    )
    owner_fk = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_contacts",
    )

    class Meta:
        ordering = ["last_name"]
        indexes = [
            models.Index(fields=["is_deleted", "last_name"]),
            models.Index(fields=["is_deleted", "company_fk"]),
            models.Index(fields=["is_deleted", "owner_fk"]),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
