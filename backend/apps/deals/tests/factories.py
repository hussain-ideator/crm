import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.deals.models import Deal, Pipeline, Stage


class PipelineFactory(DjangoModelFactory):
    class Meta:
        model = Pipeline

    name = factory.Sequence(lambda n: f"Pipeline {n}")
    is_default = False


class StageFactory(DjangoModelFactory):
    class Meta:
        model = Stage

    pipeline = factory.SubFactory(PipelineFactory)
    name = factory.Sequence(lambda n: f"Stage {n}")
    order_index = factory.Sequence(lambda n: n + 1)
    probability = 10
    is_won = False
    is_lost = False


class DealFactory(DjangoModelFactory):
    class Meta:
        model = Deal

    name = factory.Sequence(lambda n: f"Deal {n}")
    amount = None
    currency = "USD"
    close_date = None
    pipeline = None
    stage = None
    company_fk = None
    primary_contact_fk = None
    owner_fk = None
    updated_by = None
    probability = None
    is_deleted = False
    created_by = factory.SubFactory(UserFactory)
