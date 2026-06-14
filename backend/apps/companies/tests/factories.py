import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.companies.models import Company


class CompanyFactory(DjangoModelFactory):
    class Meta:
        model = Company

    name = factory.Faker("company")
    industry = factory.Faker("bs")
    website = factory.LazyAttribute(
        lambda obj: f"https://{obj.name.lower().replace(' ', '-')}.example.com"
    )
    phone = factory.Faker("phone_number")
    billing_address = factory.Faker("address")
    shipping_address = factory.Faker("address")
    annual_revenue = factory.Faker("pydecimal", left_digits=8, right_digits=2, positive=True)
    employee_count = factory.Faker("random_int", min=1, max=50000)
    owner = factory.SubFactory(UserFactory)
    created_by = factory.SubFactory(UserFactory)
