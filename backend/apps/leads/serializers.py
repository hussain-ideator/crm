from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Lead, LeadSource, LeadStatus

User = get_user_model()


class LeadSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadSource
        fields = ["id", "name"]


class _OwnerNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class _DealNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class LeadSerializer(serializers.ModelSerializer):
    source = LeadSourceSerializer(source="source_fk", read_only=True)
    source_id = serializers.PrimaryKeyRelatedField(
        source="source_fk",
        queryset=LeadSource.objects.all(),
        allow_null=True,
        required=False,
    )
    owner = _OwnerNestedSerializer(source="owner_fk", read_only=True)
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner_fk",
        queryset=User.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )
    converted_deal_fk = _DealNestedSerializer(read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "salutation",
            "first_name",
            "last_name",
            "title",
            "email",
            "phone",
            "mobile",
            "company_name",
            "website",
            "industry",
            "no_of_employees",
            "source",
            "source_id",
            "status",
            "owner",
            "owner_id",
            "converted_at",
            "converted_deal_fk",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "converted_at",
            "converted_deal_fk",
        ]

    def validate_status(self, value):
        if value == LeadStatus.CONVERTED:
            raise serializers.ValidationError(
                "Status 'converted' can only be set via the convert endpoint."
            )
        return value

    def validate_no_of_employees(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("no_of_employees must be a non-negative number.")
        return value
