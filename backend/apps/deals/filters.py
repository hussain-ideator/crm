import django_filters

from .models import Deal


class DealFilter(django_filters.FilterSet):
    stage = django_filters.NumberFilter(field_name="stage_id")
    pipeline = django_filters.NumberFilter(field_name="pipeline_id")
    owner = django_filters.NumberFilter(field_name="owner_fk_id")
    company = django_filters.NumberFilter(field_name="company_fk_id")

    class Meta:
        model = Deal
        fields = ["stage", "pipeline", "owner", "company"]
