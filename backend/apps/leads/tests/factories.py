import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.leads.models import Lead, LeadSource, LeadStatus


class LeadSourceFactory(DjangoModelFactory):
    class Meta:
        model = LeadSource

    name = factory.Sequence(lambda n: f"Source {n}")


class LeadFactory(DjangoModelFactory):
    class Meta:
        model = Lead

    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    title = ""
    email = ""
    phone = ""
    mobile = ""
    company_name = ""
    website = ""
    industry = ""
    no_of_employees = None
    source_fk = None
    status = LeadStatus.NEW
    owner_fk = factory.SubFactory(UserFactory)
    updated_by = None
    converted_at = None
    created_by = factory.SubFactory(UserFactory)
