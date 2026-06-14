"""Shared, reusable model building blocks.

These are abstract bases / mixins every business entity composes from. They
live in ``apps.core`` so no domain app depends on another just to reuse them.
"""

from django.conf import settings
from django.db import models


class TimestampedModel(models.Model):
    """Abstract base adding audit timestamps and creator tracking.

    Every business entity inherits from this (see
    ``agent-os/standards/best-practices.md`` — Data model invariants).

    Attributes:
        created_at: When the row was first inserted.
        updated_at: When the row was last saved.
        created_by: The user who created the row. ``PROTECT`` so audit history
            cannot be silently lost by deleting a user.
    """

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="+",
        null=True,
        blank=True,
        verbose_name="created by",
    )

    class Meta:
        abstract = True
        get_latest_by = "created_at"
        ordering = ["-created_at"]


class SoftDeleteQuerySet(models.QuerySet):
    """QuerySet helpers for soft-deletable models."""

    def alive(self) -> "SoftDeleteQuerySet":
        """Return only rows that have not been soft-deleted."""
        return self.filter(is_deleted=False)

    def dead(self) -> "SoftDeleteQuerySet":
        """Return only rows that have been soft-deleted."""
        return self.filter(is_deleted=True)


class SoftDeleteMixin(models.Model):
    """Abstract mixin giving a model recoverable (soft) deletion.

    Applied to entities a user will want to recover — Leads, Contacts, Deals
    (see best-practices.md). ``delete()`` flips the flag instead of issuing a
    SQL ``DELETE``; ``hard_delete()`` performs a real row removal for true
    cleanup.

    Attributes:
        is_deleted: Whether the row is soft-deleted.
        deleted_at: When the row was soft-deleted, if it has been.
    """

    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteQuerySet.as_manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """Soft-delete: mark the row deleted instead of removing it."""
        from django.utils import timezone

        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(using=using, update_fields=["is_deleted", "deleted_at"])

    def hard_delete(self, using=None, keep_parents=False):
        """Permanently remove the row from the database."""
        return super().delete(using=using, keep_parents=keep_parents)

    def restore(self) -> None:
        """Reverse a soft delete."""
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=["is_deleted", "deleted_at"])
