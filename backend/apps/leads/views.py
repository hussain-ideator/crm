from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import LeadFilter
from .models import Lead, LeadSource, LeadStatus
from .pagination import LeadPageNumberPagination
from .serializers import LeadSerializer, LeadSourceSerializer


@extend_schema_view(
    list=extend_schema(summary="List lead sources"),
    retrieve=extend_schema(summary="Retrieve a lead source"),
)
class LeadSourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LeadSource.objects.all()
    serializer_class = LeadSourceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


@extend_schema_view(
    list=extend_schema(
        summary="List leads",
        parameters=[
            OpenApiParameter(
                "q",
                OpenApiTypes.STR,
                description="Search across first_name, last_name, email, company_name, phone",
            ),
            OpenApiParameter(
                "status",
                OpenApiTypes.STR,
                description="Filter by status (new, contacted, qualified, unqualified, converted)",
            ),
            OpenApiParameter("source", OpenApiTypes.INT, description="Filter by lead source ID"),
            OpenApiParameter("owner", OpenApiTypes.INT, description="Filter by owner user ID"),
            OpenApiParameter(
                "ordering",
                OpenApiTypes.STR,
                description="Sort field; prefix with - for descending (default: -created_at)",
            ),
            OpenApiParameter("page", OpenApiTypes.INT, description="1-based page number"),
            OpenApiParameter(
                "page_size", OpenApiTypes.INT, description="Results per page (max 100)"
            ),
        ],
        responses={200: LeadSerializer(many=True), 401: None},
    ),
    create=extend_schema(
        summary="Create a lead",
        responses={201: LeadSerializer, 400: None, 401: None},
    ),
    retrieve=extend_schema(
        summary="Retrieve a lead",
        responses={200: LeadSerializer, 401: None, 404: None},
    ),
    update=extend_schema(
        summary="Replace a lead (PUT)",
        responses={200: LeadSerializer, 400: None, 401: None, 403: None, 404: None},
    ),
    partial_update=extend_schema(
        summary="Partially update a lead (PATCH)",
        responses={200: LeadSerializer, 400: None, 401: None, 403: None, 404: None},
    ),
    destroy=extend_schema(
        summary="Soft-delete a lead",
        responses={204: None, 401: None, 403: None, 404: None},
    ),
)
class LeadViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = LeadPageNumberPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = LeadFilter
    ordering = ["-created_at"]
    ordering_fields = [
        "first_name",
        "last_name",
        "email",
        "company_name",
        "status",
        "created_at",
        "owner_fk",
    ]
    serializer_class = LeadSerializer

    def get_queryset(self):
        return Lead.objects.filter(is_deleted=False).select_related(
            "source_fk", "owner_fk", "created_by", "updated_by"
        )

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            status=serializer.validated_data.get("status", LeadStatus.NEW),
        )

    def update(self, request, *args, **kwargs):
        lead = self.get_object()
        if lead.status == LeadStatus.CONVERTED:
            raise PermissionDenied("Converted leads are read-only.")
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        lead = self.get_object()
        if lead.status == LeadStatus.CONVERTED:
            raise PermissionDenied("Converted leads are read-only.")
        return super().partial_update(request, *args, **kwargs)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        lead = self.get_object()
        if lead.status == LeadStatus.CONVERTED:
            raise PermissionDenied("Converted leads cannot be deleted.")
        lead.is_deleted = True
        lead.save(update_fields=["is_deleted", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Convert lead to deal",
        responses={200: LeadSerializer, 400: None, 401: None, 404: None},
    )
    @action(detail=True, methods=["post"], url_path="convert")
    def convert(self, request, pk=None):
        from .services import convert_lead_to_deal

        lead = self.get_object()
        try:
            convert_lead_to_deal(lead, request.user)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        lead.refresh_from_db()
        serializer = self.get_serializer(lead)
        return Response(serializer.data, status=status.HTTP_200_OK)
