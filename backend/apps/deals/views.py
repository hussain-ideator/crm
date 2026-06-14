from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .filters import DealFilter
from .models import Deal, Pipeline
from .pagination import DealPageNumberPagination
from .serializers import DealSerializer, PipelineSerializer


class PipelineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pipeline.objects.all().prefetch_related("stages")
    serializer_class = PipelineSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None


class DealViewSet(viewsets.ModelViewSet):
    serializer_class = DealSerializer
    pagination_class = DealPageNumberPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DealFilter
    ordering = ["-created_at"]
    ordering_fields = ["name", "amount", "close_date", "probability", "created_at", "owner_fk"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Deal.objects.filter(is_deleted=False).select_related(
            "pipeline",
            "stage",
            "company_fk",
            "primary_contact_fk",
            "owner_fk",
        )
        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(company_fk__name__icontains=q))
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        deal = self.get_object()
        deal.is_deleted = True
        deal.save(update_fields=["is_deleted", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)
