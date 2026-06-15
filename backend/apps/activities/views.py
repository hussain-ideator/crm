from django.db.models import F, Q
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin, UpdateModelMixin
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .filters import ActivityFilter
from .models import Activity
from .pagination import ActivityPageNumberPagination
from .serializers import ActivitySerializer


class _ActivityOrderingFilter(OrderingFilter):
    """Skip client-controlled ordering when feed sort is active (Decision 2)."""

    def filter_queryset(self, request, queryset, view):
        ct_label = request.query_params.get("content_type", "").strip()
        oid = request.query_params.get("object_id", "").strip()
        if ct_label and oid:
            # Feed sort already applied in get_queryset(); do not override it.
            return queryset
        return super().filter_queryset(request, queryset, view)


class ActivityViewSet(
    CreateModelMixin,
    ListModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
    GenericViewSet,
):
    serializer_class = ActivitySerializer
    pagination_class = ActivityPageNumberPagination
    filter_backends = [DjangoFilterBackend, _ActivityOrderingFilter]
    filterset_class = ActivityFilter
    ordering_fields = ["subject", "due_at", "completed_at", "created_at", "type", "assigned_to"]
    ordering = ["-created_at"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Activity.objects.filter(is_deleted=False).select_related(
            "assigned_to", "content_type", "created_by"
        )
        q = self.request.query_params.get("q", "").strip()
        if q:
            qs = qs.filter(Q(subject__icontains=q) | Q(description__icontains=q))
        ct_label = self.request.query_params.get("content_type", "").strip()
        oid = self.request.query_params.get("object_id", "").strip()
        # Decision 2: feed sort applied only when both params present
        if ct_label and oid:
            return qs.order_by(F("due_at").asc(nulls_last=True), "-created_at")
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        activity = self.get_object()
        activity.is_deleted = True
        activity.save(update_fields=["is_deleted", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="complete")
    def mark_complete(self, request, pk=None):
        activity = self.get_object()
        activity.completed_at = timezone.now()
        activity.save(update_fields=["completed_at", "updated_at"])
        return Response(ActivitySerializer(activity, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="incomplete")
    def mark_incomplete(self, request, pk=None):
        activity = self.get_object()
        activity.completed_at = None
        activity.save(update_fields=["completed_at", "updated_at"])
        return Response(ActivitySerializer(activity, context={"request": request}).data)
