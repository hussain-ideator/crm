from django.conf import settings
from django.db import models

from apps.core.models import SoftDeleteMixin, TimestampedModel


class Salutation(models.TextChoices):
    MR = "Mr.", "Mr."
    MS = "Ms.", "Ms."
    MRS = "Mrs.", "Mrs."
    DR = "Dr.", "Dr."
    MX = "Mx.", "Mx."
    NONE = "", "None"


class LeadStatus(models.TextChoices):
    NEW = "new", "New"
    CONTACTED = "contacted", "Contacted"
    QUALIFIED = "qualified", "Qualified"
    UNQUALIFIED = "unqualified", "Unqualified"
    CONVERTED = "converted", "Converted"


class LeadSource(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Lead(TimestampedModel, SoftDeleteMixin):
    salutation = models.CharField(max_length=5, choices=Salutation.choices, blank=True, default="")
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    title = models.CharField(max_length=150, blank=True, default="")
    email = models.EmailField(max_length=254, blank=True, default="")
    phone = models.CharField(max_length=50, blank=True, default="")
    mobile = models.CharField(max_length=50, blank=True, default="")
    company_name = models.CharField(max_length=255, blank=True, default="")
    website = models.URLField(max_length=255, blank=True, default="")
    industry = models.CharField(max_length=100, blank=True, default="")
    no_of_employees = models.PositiveIntegerField(null=True, blank=True)
    source_fk = models.ForeignKey(
        LeadSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
    )
    owner_fk = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_leads",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_leads",
    )
    converted_at = models.DateTimeField(null=True, blank=True)
    # converted_deal_fk is defined in migration 0003 once the deals app is installed.

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_deleted", "status"]),
            models.Index(fields=["is_deleted", "source_fk"]),
            models.Index(fields=["is_deleted", "owner_fk"]),
            models.Index(fields=["is_deleted", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
