from django.apps import apps as django_apps
from django.db import transaction
from django.utils import timezone

from .models import LeadStatus


def convert_lead_to_deal(lead, requesting_user):
    from apps.companies.models import Company
    from apps.contacts.models import Contact

    if lead.status == LeadStatus.CONVERTED:
        raise ValueError("Lead is already converted.")

    with transaction.atomic():
        company = None
        if lead.company_name:
            company = Company.objects.create(
                name=lead.company_name,
                industry=lead.industry,
                website=lead.website,
                created_by=requesting_user,
            )

        Contact.objects.create(
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            title=lead.title,
            company_fk=company,
            owner_fk=lead.owner_fk,
            created_by=requesting_user,
        )

        deal = None
        try:
            Deal = django_apps.get_model("deals", "Deal")
            deal = Deal.objects.create(
                name=f"{lead.first_name} {lead.last_name}".strip(),
                created_by=requesting_user,
            )
        except LookupError:
            # deals app not yet installed — deal creation deferred until 0003 migration lands
            pass

        lead.status = LeadStatus.CONVERTED
        lead.converted_at = timezone.now()
        update_fields = ["status", "converted_at", "updated_at"]
        if deal is not None and hasattr(lead, "converted_deal_fk_id"):
            lead.converted_deal_fk = deal
            update_fields.append("converted_deal_fk_id")
        lead.save(update_fields=update_fields)

    return deal
