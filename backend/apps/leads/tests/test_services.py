from unittest.mock import MagicMock, patch

import pytest
from django.db import IntegrityError

from apps.accounts.tests.factories import UserFactory
from apps.leads.models import LeadStatus
from apps.leads.services import convert_lead_to_deal
from apps.leads.tests.factories import LeadFactory


def _mock_deal_class():
    mock_deal = MagicMock()
    mock_deal.id = 1
    mock_deal.name = "Test Deal"
    mock_deal_class = MagicMock()
    mock_deal_class.objects.create.return_value = mock_deal
    return mock_deal_class, mock_deal


@pytest.mark.django_db
class TestConvertLeadService:
    def test_convert_with_company_name(self):
        lead = LeadFactory(
            first_name="Jane",
            last_name="Smith",
            company_name="Acme Corp",
            industry="Tech",
            status=LeadStatus.NEW,
        )
        user = UserFactory()
        mock_deal_class, _ = _mock_deal_class()

        with patch("apps.leads.services.django_apps.get_model", return_value=mock_deal_class):
            convert_lead_to_deal(lead, user)

        from apps.companies.models import Company
        from apps.contacts.models import Contact

        assert Company.objects.filter(name="Acme Corp").exists()
        contact = Contact.objects.get(first_name="Jane", last_name="Smith")
        assert contact.company_fk is not None
        mock_deal_class.objects.create.assert_called_once()
        lead.refresh_from_db()
        assert lead.status == LeadStatus.CONVERTED
        assert lead.converted_at is not None

    def test_convert_without_company_name(self):
        lead = LeadFactory(
            first_name="Bob",
            last_name="Jones",
            company_name="",
            status=LeadStatus.NEW,
        )
        user = UserFactory()
        mock_deal_class, _ = _mock_deal_class()

        with patch("apps.leads.services.django_apps.get_model", return_value=mock_deal_class):
            convert_lead_to_deal(lead, user)

        from apps.companies.models import Company
        from apps.contacts.models import Contact

        assert Company.objects.count() == 0
        contact = Contact.objects.get(first_name="Bob", last_name="Jones")
        assert contact.company_fk is None
        mock_deal_class.objects.create.assert_called_once()
        lead.refresh_from_db()
        assert lead.status == LeadStatus.CONVERTED

    def test_convert_rolls_back_on_failure(self):
        lead = LeadFactory(
            company_name="Acme Corp",
            status=LeadStatus.NEW,
        )
        user = UserFactory()
        mock_deal_class, _ = _mock_deal_class()

        with (
            patch("apps.leads.services.django_apps.get_model", return_value=mock_deal_class),
            patch(
                "apps.contacts.models.Contact.objects.create",
                side_effect=IntegrityError("integrity error"),
            ),
            pytest.raises(IntegrityError),
        ):
            convert_lead_to_deal(lead, user)

        from apps.companies.models import Company
        from apps.contacts.models import Contact

        assert Company.objects.count() == 0
        assert Contact.objects.count() == 0
        mock_deal_class.objects.create.assert_not_called()
        lead.refresh_from_db()
        assert lead.status == LeadStatus.NEW

    def test_convert_already_converted_raises(self):
        lead = LeadFactory(status=LeadStatus.CONVERTED)
        user = UserFactory()

        with pytest.raises(ValueError, match="already converted"):
            convert_lead_to_deal(lead, user)

    @pytest.mark.xfail(reason="deals app not yet installed — unblock when 0003 migration lands")
    def test_convert_sets_deal_link_on_lead(self):
        lead = LeadFactory(
            first_name="Alice",
            last_name="Walker",
            status=LeadStatus.NEW,
        )
        user = UserFactory()
        mock_deal_class, mock_deal = _mock_deal_class()

        with patch("apps.leads.services.django_apps.get_model", return_value=mock_deal_class):
            convert_lead_to_deal(lead, user)

        lead.refresh_from_db()
        # converted_deal_fk field exists only after migration 0003 lands
        assert lead.converted_deal_fk is not None
        assert lead.converted_deal_fk.id == mock_deal.id
