from datetime import timedelta

import pytest
from django.utils import timezone

from apps.accounts.models import RefreshTokenFamily, RefreshTokenLineage
from apps.accounts.tests.factories import UserFactory


@pytest.mark.django_db
class TestRefreshTokenFamily:
    def test_created_with_is_revoked_false(self):
        user = UserFactory()
        family = RefreshTokenFamily.objects.create(user=user)
        assert family.is_revoked is False
        assert family.user == user

    def test_revoke_family_sets_flag(self):
        user = UserFactory()
        family = RefreshTokenFamily.objects.create(user=user)
        family.revoke_family()
        family.refresh_from_db()
        assert family.is_revoked is True

    def test_revoke_family_deactivates_all_lineage(self):
        user = UserFactory()
        family = RefreshTokenFamily.objects.create(user=user)
        expires = timezone.now() + timedelta(days=7)
        lineage_a = RefreshTokenLineage.objects.create(
            jti="aaaa-0001", family=family, expires_at=expires
        )
        lineage_b = RefreshTokenLineage.objects.create(
            jti="aaaa-0002", family=family, expires_at=expires
        )
        family.revoke_family()
        lineage_a.refresh_from_db()
        lineage_b.refresh_from_db()
        assert lineage_a.is_active is False
        assert lineage_b.is_active is False
        assert lineage_a.revoked_at is not None
        assert lineage_b.revoked_at is not None


@pytest.mark.django_db
class TestRefreshTokenLineage:
    def test_created_with_is_active_true(self):
        user = UserFactory()
        family = RefreshTokenFamily.objects.create(user=user)
        expires = timezone.now() + timedelta(days=7)
        lineage = RefreshTokenLineage.objects.create(
            jti="bbbb-0001", family=family, expires_at=expires
        )
        assert lineage.is_active is True
        assert lineage.revoked_at is None

    def test_expires_at_stored_correctly(self):
        user = UserFactory()
        family = RefreshTokenFamily.objects.create(user=user)
        expires = timezone.now() + timedelta(days=7)
        lineage = RefreshTokenLineage.objects.create(
            jti="bbbb-0002", family=family, expires_at=expires
        )
        delta = abs((lineage.expires_at - expires).total_seconds())
        assert delta < 1
