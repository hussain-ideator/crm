"""Account / identity models.

The custom ``User`` is declared here and wired up via
``AUTH_USER_MODEL = "accounts.User"`` in settings before the first migration,
so the project never runs on Django's default user table.
"""

from django.contrib.auth.models import AbstractUser
from django.db import models


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
