import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.companies.tests.factories import CompanyFactory
from apps.contacts.models import Contact


class ContactFactory(DjangoModelFactory):
    class Meta:
        model = Contact

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    email = factory.Faker("email")
    phone = factory.Faker("phone_number")
    title = factory.Faker("job")
    company_fk = factory.SubFactory(CompanyFactory)
    owner_fk = factory.SubFactory(UserFactory)
    created_by = factory.SubFactory(UserFactory)
