from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response

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

    def create(self, request, *args, **kwargs):
        write_serializer = self.get_serializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        self.perform_create(write_serializer)
        read_serializer = CompanySerializer(
            write_serializer.instance,
            context=self.get_serializer_context(),
        )
        headers = self.get_success_headers(read_serializer.data)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
