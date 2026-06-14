from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from .filters import CompanyFilterSet, CompanySearchFilter
from .models import Company
from .pagination import CompanyPageNumberPagination
from .serializers import CompanySerializer, CompanyWriteSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    pagination_class = CompanyPageNumberPagination
    filter_backends = [DjangoFilterBackend, CompanySearchFilter, OrderingFilter]
    filterset_class = CompanyFilterSet
    search_fields = ["name", "website", "phone"]
    ordering_fields = [
        "name",
        "industry",
        "annual_revenue",
        "employee_count",
        "created_at",
        "updated_at",
    ]
    ordering = ["name"]

    def get_queryset(self):
        return Company.objects.alive().select_related("owner", "created_by")

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return CompanyWriteSerializer
        return CompanySerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
