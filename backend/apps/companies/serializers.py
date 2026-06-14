from decimal import Decimal

from rest_framework import serializers

from .models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "industry",
            "website",
            "phone",
            "billing_address",
            "shipping_address",
            "annual_revenue",
            "employee_count",
            "owner",
            "created_at",
            "updated_at",
            "created_by",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by"]


class CompanyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "name",
            "industry",
            "website",
            "phone",
            "billing_address",
            "shipping_address",
            "annual_revenue",
            "employee_count",
            "owner",
        ]

    def validate_annual_revenue(self, value):
        if value is not None and value < Decimal("0"):
            raise serializers.ValidationError(
                "annual_revenue must be a non-negative number."
            )
        return value
