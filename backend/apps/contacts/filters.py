import django_filters
from django.db.models import Q
from rest_framework.filters import BaseFilterBackend

from .models import Contact


class ContactFilterSet(django_filters.FilterSet):
    company = django_filters.NumberFilter(field_name="company_fk__id")
    owner = django_filters.NumberFilter(field_name="owner_fk__id")

    class Meta:
        model = Contact
        fields = ["company", "owner"]


class ContactSearchFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        q = request.query_params.get("q", "").strip()
        if not q:
            return queryset
        return queryset.filter(
            Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
            | Q(email__icontains=q)
            | Q(phone__icontains=q)
        )
