from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter

from .filters import ContactFilterSet, ContactSearchFilter
from .models import Contact
from .pagination import ContactPageNumberPagination
from .serializers import ContactSerializer


@extend_schema_view(
    list=extend_schema(
        summary="List contacts",
        parameters=[
            OpenApiParameter("q", OpenApiTypes.STR, description="Search across first_name, last_name, email, phone"),
            OpenApiParameter("company", OpenApiTypes.INT, description="Filter by company ID"),
            OpenApiParameter("owner", OpenApiTypes.INT, description="Filter by owner user ID"),
            OpenApiParameter("ordering", OpenApiTypes.STR, description="Sort field; prefix with - for descending (default: last_name)"),
            OpenApiParameter("page", OpenApiTypes.INT, description="1-based page number"),
            OpenApiParameter("page_size", OpenApiTypes.INT, description="Results per page (max 100)"),
        ],
    ),
    create=extend_schema(summary="Create a contact"),
    retrieve=extend_schema(summary="Retrieve a contact"),
    update=extend_schema(summary="Replace a contact (PUT)"),
    partial_update=extend_schema(summary="Partially update a contact (PATCH)"),
    destroy=extend_schema(summary="Soft-delete a contact"),
)
class ContactViewSet(viewsets.ModelViewSet):
    pagination_class = ContactPageNumberPagination
    filter_backends = [DjangoFilterBackend, ContactSearchFilter, OrderingFilter]
    filterset_class = ContactFilterSet
    ordering_fields = ["first_name", "last_name", "email", "phone", "title", "created_at"]
    ordering = ["last_name"]

    def get_queryset(self):
        return Contact.objects.alive().select_related("company_fk", "owner_fk", "created_by")

    def get_serializer_class(self):
        return ContactSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
