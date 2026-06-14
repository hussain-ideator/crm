from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.companies.models import Company

from .models import Contact

User = get_user_model()


class _CompanyNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class _OwnerNestedSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class ContactSerializer(serializers.ModelSerializer):
    company = _CompanyNestedSerializer(source="company_fk", read_only=True)
    owner = _OwnerNestedSerializer(source="owner_fk", read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        source="company_fk",
        queryset=Company.objects.filter(is_deleted=False),
        allow_null=True,
        required=False,
    )
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner_fk",
        queryset=User.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "title",
            "company",
            "company_id",
            "owner",
            "owner_id",
            "created_at",
            "updated_at",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by"]
