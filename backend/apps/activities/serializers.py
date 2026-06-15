from django.contrib.auth import get_user_model
from rest_framework import serializers

from .filters import CONTENT_TYPE_LABEL_MAP, resolve_content_type_from_label
from .models import Activity

User = get_user_model()

# Reverse map: ContentType id → label string
_CONTENT_TYPE_ID_TO_LABEL: dict[int, str] | None = None


def _get_ct_id_to_label() -> dict[int, str]:
    """Build and cache the reverse label map (ContentType.id → label)."""
    global _CONTENT_TYPE_ID_TO_LABEL
    if _CONTENT_TYPE_ID_TO_LABEL is None:
        from django.contrib.contenttypes.models import ContentType

        mapping = {}
        for label, (app_label, model_name) in CONTENT_TYPE_LABEL_MAP.items():
            try:
                ct = ContentType.objects.get(app_label=app_label, model=model_name)
                mapping[ct.id] = label
            except ContentType.DoesNotExist:
                pass
        _CONTENT_TYPE_ID_TO_LABEL = mapping
    return _CONTENT_TYPE_ID_TO_LABEL


class UserMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField()

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class ActivitySerializer(serializers.ModelSerializer):
    # Write fields
    type = serializers.ChoiceField(choices=Activity.ActivityType.choices)
    subject = serializers.CharField(max_length=500)
    description = serializers.CharField(default="", allow_blank=True, required=False)
    due_at = serializers.DateTimeField(allow_null=True, required=False)
    completed_at = serializers.DateTimeField(allow_null=True, required=False)
    assigned_to_id = serializers.PrimaryKeyRelatedField(
        source="assigned_to",
        queryset=User.objects.filter(is_active=True),
        allow_null=True,
        required=False,
        write_only=True,
    )
    content_type = serializers.CharField(allow_null=True, required=False)
    object_id = serializers.IntegerField(min_value=1, allow_null=True, required=False)

    # Read fields
    assigned_to = UserMinimalSerializer(read_only=True)
    created_by = UserMinimalSerializer(read_only=True)
    is_deleted = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Activity
        fields = [
            "id",
            "type",
            "subject",
            "description",
            "due_at",
            "completed_at",
            "assigned_to_id",
            "assigned_to",
            "content_type",
            "object_id",
            "is_deleted",
            "created_by",
            "created_at",
            "updated_at",
        ]

    def to_internal_value(self, data):
        # Pop content_type label before standard validation so it doesn't
        # fail the FK validation — we handle it ourselves.
        ct_label = data.get("content_type")
        ret = super().to_internal_value(data)

        if ct_label is not None:
            ct = resolve_content_type_from_label(str(ct_label))
            if ct is None:
                raise serializers.ValidationError(
                    {
                        "content_type": (
                            f"Invalid label: {ct_label!r}. "
                            f"Allowed: {sorted(CONTENT_TYPE_LABEL_MAP)}"
                        )
                    }
                )
            ret["content_type"] = ct
        else:
            ret["content_type"] = None

        return ret

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Convert stored ContentType FK back to label string
        ct = instance.content_type
        if ct is not None:
            label_map = _get_ct_id_to_label()
            ret["content_type"] = label_map.get(ct.id)
        else:
            ret["content_type"] = None
        return ret

    def validate(self, attrs):
        ct = attrs.get("content_type")
        oid = attrs.get("object_id")

        # Both must be present or both null (FR-014)
        # For PATCH, also check against existing instance values
        if self.instance is not None:
            # On partial update, unset fields fall back to instance values
            if "content_type" not in self.initial_data and "object_id" not in self.initial_data:
                return attrs
            if "content_type" not in self.initial_data:
                ct = self.instance.content_type
            if "object_id" not in self.initial_data:
                oid = self.instance.object_id

        ct_provided = ct is not None
        oid_provided = oid is not None

        if ct_provided != oid_provided:
            raise serializers.ValidationError(
                "content_type and object_id must both be provided or both be null."
            )

        # NO existence check against the target record (Decision 1 — Phase 1 soft reference)
        return attrs

    def create(self, validated_data):
        return Activity.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
