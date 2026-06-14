"""Account / identity models.

The custom ``User`` is declared here and wired up via
``AUTH_USER_MODEL = "accounts.User"`` in settings before the first migration,
so the project never runs on Django's default user table.
"""

import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """Application user.

    Extends Django's ``AbstractUser`` so we keep the battle-tested auth fields
    (username, password, permissions, ``is_staff``/``is_active``) while owning
    the table from day one. Domain-specific fields (role, avatar, etc.) are
    added here as the product grows rather than via a separate profile model.
    """

    # Email is unique and the primary contact handle for a CRM user.
    email = models.EmailField("email address", unique=True)

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["username"]

    def __str__(self) -> str:
        return self.get_full_name() or self.username


class RefreshTokenFamily(models.Model):
    """Groups all refresh tokens issued from a single login event.

    Used for reuse detection: presenting a stale token from this family triggers
    full revocation of is_revoked + all lineage members.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="token_families",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_revoked = models.BooleanField(default=False, db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=["user", "is_revoked"]),
            models.Index(fields=["created_at"]),
        ]

    def revoke_family(self) -> None:
        """Revoke this family and deactivate every lineage record it owns."""
        now = timezone.now()
        self.is_revoked = True
        self.save(update_fields=["is_revoked"])
        self.lineage.filter(is_active=True).update(is_active=False, revoked_at=now)

    def __str__(self) -> str:
        return f"Family({self.id}, user={self.user_id}, revoked={self.is_revoked})"


class RefreshTokenLineage(models.Model):
    """Tracks one issued refresh token within its family.

    ``jti`` is the JWT ``jti`` claim (UUID). Each refresh rotation deactivates
    the current record and creates a successor, enabling stale-token detection.
    """

    jti = models.CharField(primary_key=True, max_length=36)
    family = models.ForeignKey(
        RefreshTokenFamily,
        on_delete=models.CASCADE,
        related_name="lineage",
    )
    is_active = models.BooleanField(default=True, db_index=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["family", "is_active"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self) -> str:
        return f"Lineage(jti={self.jti}, active={self.is_active})"
