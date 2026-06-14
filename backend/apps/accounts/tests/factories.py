import uuid

import factory
from factory.django import DjangoModelFactory

from apps.accounts.models import User


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        skip_postgeneration_save = True

    # UUID suffix prevents collisions when keepdb reuses the dev database
    # and a previous test session left rows behind after an unclean shutdown.
    username = factory.LazyFunction(lambda: f"user_{uuid.uuid4().hex[:8]}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    is_active = True

    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        raw = extracted or "testpass123"
        obj.set_password(raw)
        if create:
            obj.save()
