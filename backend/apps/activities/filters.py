from django.apps import apps as django_apps
from django.contrib.contenttypes.models import ContentType
import django_filters
from rest_framework import serializers

from .models import Activity

CONTENT_TYPE_LABEL_MAP: dict[str, tuple[str, str]] = {
    "lead": ("leads", "lead"),
    "contact": ("contacts", "contact"),
    "company": ("companies", "company"),
    "deal": ("deals", "deal"),
}


def resolve_content_type_from_label(label: str) -> ContentType | None:
    entry = CONTENT_TYPE_LABEL_MAP.get(label.lower())
    if not entry:
        return None
    app_label, model_name = entry
    model_class = django_apps.get_model(app_label, model_name)
    return ContentType.objects.get_for_model(model_class)


class ActivityFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(field_name="type")
    assigned_to = django_filters.NumberFilter(field_name="assigned_to_id")

    class Meta:
        model = Activity
        fields = ["type", "assigned_to"]

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        ct_label = self.data.get("content_type", "").strip()
        oid = self.data.get("object_id", "").strip()

        if ct_label or oid:
            if not (ct_label and oid):
                raise serializers.ValidationError(
                    "content_type and object_id must both be provided together."
                )
            ct = resolve_content_type_from_label(ct_label)
            if ct is None:
                raise serializers.ValidationError(
                    {
                        "content_type": (
                            f"Invalid label: {ct_label!r}. "
                            f"Allowed: {sorted(CONTENT_TYPE_LABEL_MAP)}"
                        )
                    }
                )
            try:
                oid_int = int(oid)
            except ValueError:
                raise serializers.ValidationError({"object_id": "Must be an integer."})
            queryset = queryset.filter(content_type=ct, object_id=oid_int)
        return queryset
