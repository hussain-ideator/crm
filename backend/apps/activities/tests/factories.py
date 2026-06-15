import factory
from factory.django import DjangoModelFactory

from apps.accounts.tests.factories import UserFactory
from apps.activities.models import Activity


class ActivityFactory(DjangoModelFactory):
    class Meta:
        model = Activity

    type = Activity.ActivityType.TASK
    subject = factory.Sequence(lambda n: f"Activity {n}")
    description = ""
    due_at = None
    completed_at = None
    assigned_to = None
    content_type = None
    object_id = None
    is_deleted = False
    created_by = factory.SubFactory(UserFactory)
