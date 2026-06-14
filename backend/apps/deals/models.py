from django.conf import settings
from django.db import models

from apps.core.models import TimestampedModel


class Pipeline(models.Model):
    name = models.CharField(max_length=200)
    is_default = models.BooleanField(default=False)

    class Meta:
        db_table = "deals_pipeline"

    def __str__(self) -> str:
        return self.name


class Stage(models.Model):
    pipeline = models.ForeignKey(
        Pipeline,
        on_delete=models.CASCADE,
        related_name="stages",
    )
    name = models.CharField(max_length=200)
    order_index = models.PositiveSmallIntegerField()
    probability = models.PositiveSmallIntegerField(default=0)
    is_won = models.BooleanField(default=False)
    is_lost = models.BooleanField(default=False)

    class Meta:
        db_table = "deals_stage"
        unique_together = [("pipeline", "order_index")]
        ordering = ["order_index"]

    def __str__(self) -> str:
        return self.name


class Deal(TimestampedModel):
    name = models.CharField(max_length=500)
    amount = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, default="USD")
    close_date = models.DateField(null=True, blank=True)
    pipeline = models.ForeignKey(
        Pipeline,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="deals",
    )
    stage = models.ForeignKey(
        Stage,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="deals",
    )
    company_fk = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    primary_contact_fk = models.ForeignKey(
        "contacts.Contact",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    owner_fk = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_deals",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_deals",
    )
    probability = models.PositiveSmallIntegerField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = "deals_deal"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name
