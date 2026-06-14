import pytest

from apps.companies.tests.factories import CompanyFactory
from apps.contacts.models import Contact
from apps.contacts.tests.factories import ContactFactory


@pytest.mark.django_db
class TestCompanySoftDeleteSignal:
    def test_soft_deleting_company_nullifies_contact_company_fk(self):
        company = CompanyFactory()
        contact = ContactFactory(company_fk=company)

        company.delete()
        contact.refresh_from_db()

        assert contact.company_fk is None

    def test_soft_deleting_company_does_not_delete_contact(self):
        company = CompanyFactory()
        contact = ContactFactory(company_fk=company)

        company.delete()
        contact.refresh_from_db()

        assert contact.is_deleted is False

    def test_soft_deleting_company_nullifies_multiple_contacts(self):
        company = CompanyFactory()
        contacts = ContactFactory.create_batch(3, company_fk=company)

        company.delete()

        for c in contacts:
            c.refresh_from_db()
            assert c.company_fk is None

    def test_contacts_of_other_companies_unaffected(self):
        company_a = CompanyFactory()
        company_b = CompanyFactory()
        contact_a = ContactFactory(company_fk=company_a)
        contact_b = ContactFactory(company_fk=company_b)

        company_a.delete()

        contact_a.refresh_from_db()
        contact_b.refresh_from_db()
        assert contact_a.company_fk is None
        assert contact_b.company_fk == company_b

    def test_contact_with_no_company_unaffected_by_any_soft_delete(self):
        company = CompanyFactory()
        contact = ContactFactory(company_fk=None)

        company.delete()
        contact.refresh_from_db()

        assert contact.company_fk is None
        assert contact.is_deleted is False
