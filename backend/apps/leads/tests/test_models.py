import pytest

from apps.leads.models import Lead, LeadStatus, Salutation
from apps.leads.tests.factories import LeadFactory


@pytest.mark.django_db
class TestLeadModelChoices:
    def test_lead_status_has_exactly_5_choices(self):
        assert len(LeadStatus.choices) == 5

    def test_salutation_has_exactly_6_choices(self):
        assert len(Salutation.choices) == 6

    def test_default_status_is_new(self):
        lead = LeadFactory()
        assert lead.status == LeadStatus.NEW

    def test_is_deleted_defaults_to_false(self):
        lead = LeadFactory()
        assert lead.is_deleted is False

    def test_no_of_employees_is_positive_integer_field(self):
        from django.db.models import PositiveIntegerField

        field = Lead._meta.get_field("no_of_employees")
        assert isinstance(field, PositiveIntegerField)
