from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.core.models import TimestampedModel


class Activity(TimestampedModel):
    class ActivityType(models.TextChoices):
        TASK = "task", "Task"
        CALL = "call", "Call"
        MEETING = "meeting", "Meeting"

    type = models.CharField(max_length=20, choices=ActivityType.choices)
    subject = models.CharField(max_length=500)
    description = models.TextField(blank=True, default="")
    due_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_activities",
    )
    content_type = models.ForeignKey(
        ContentType,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey("content_type", "object_id")
    is_deleted = models.BooleanField(default=False, db_index=True)

    class Meta:
        db_table = "activities_activity"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]

    def __str__(self):
        return self.subject
