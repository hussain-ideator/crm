import django_filters
from django.db.models import Q

from .models import Lead


class LeadFilter(django_filters.FilterSet):
    status = django_filters.CharFilter(field_name="status", lookup_expr="exact")
    source = django_filters.NumberFilter(field_name="source_fk_id")
    owner = django_filters.NumberFilter(field_name="owner_fk_id")
    q = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Lead
        fields = ["status", "source", "owner"]

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        return queryset.filter(
            Q(first_name__icontains=value)
            | Q(last_name__icontains=value)
            | Q(email__icontains=value)
            | Q(company_name__icontains=value)
            | Q(phone__icontains=value)
        )
