import pytest

from apps.accounts.tests.factories import UserFactory
from apps.companies.models import Company
from apps.companies.tests.factories import CompanyFactory


@pytest.mark.django_db
class TestCompanyStr:
    def test_str_returns_name(self):
        company = CompanyFactory.build(name="Acme Corp")
        assert str(company) == "Acme Corp"


@pytest.mark.django_db
class TestCompanySoftDelete:
    def test_soft_delete_sets_is_deleted_and_deleted_at(self):
        company = CompanyFactory()
        assert company.is_deleted is False
        assert company.deleted_at is None

        company.delete()
        company.refresh_from_db()

        assert company.is_deleted is True
        assert company.deleted_at is not None

    def test_alive_excludes_soft_deleted_records(self):
        alive = CompanyFactory()
        deleted = CompanyFactory()
        deleted.delete()

        qs = Company.objects.alive()
        assert alive in qs
        assert deleted not in qs

    def test_dead_returns_only_soft_deleted_records(self):
        alive = CompanyFactory()
        deleted = CompanyFactory()
        deleted.delete()

        qs = Company.objects.dead()
        assert alive not in qs
        assert deleted in qs

    def test_owner_set_null_when_user_deleted(self):
        user = UserFactory()
        company = CompanyFactory(owner=user)

        user.delete()
        company.refresh_from_db()

        assert company.owner is None
