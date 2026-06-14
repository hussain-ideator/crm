from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.companies.models import Company
from apps.contacts.models import Contact

from .models import Deal, Pipeline, Stage

User = get_user_model()


class StageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stage
        fields = ["id", "name", "order_index", "probability", "is_won", "is_lost"]


class PipelineSerializer(serializers.ModelSerializer):
    stages = StageSerializer(many=True, read_only=True)

    class Meta:
        model = Pipeline
        fields = ["id", "name", "is_default", "stages"]


class _CompanyMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()


class _ContactMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()


class _UserMinimalSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField()

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class DealSerializer(serializers.ModelSerializer):
    # Write-only FK fields
    pipeline_id = serializers.PrimaryKeyRelatedField(
        source="pipeline",
        queryset=Pipeline.objects.all(),
        allow_null=True,
        required=False,
    )
    stage_id = serializers.PrimaryKeyRelatedField(
        source="stage",
        queryset=Stage.objects.all(),
        allow_null=True,
        required=False,
    )
    company_id = serializers.PrimaryKeyRelatedField(
        source="company_fk",
        queryset=Company.objects.all(),
        allow_null=True,
        required=False,
    )
    primary_contact_id = serializers.PrimaryKeyRelatedField(
        source="primary_contact_fk",
        queryset=Contact.objects.all(),
        allow_null=True,
        required=False,
    )
    owner_id = serializers.PrimaryKeyRelatedField(
        source="owner_fk",
        queryset=User.objects.filter(is_active=True),
        allow_null=True,
        required=False,
    )

    # Read-only nested representations
    pipeline = PipelineSerializer(read_only=True)
    stage = StageSerializer(read_only=True)
    company = _CompanyMinimalSerializer(source="company_fk", read_only=True)
    primary_contact = _ContactMinimalSerializer(source="primary_contact_fk", read_only=True)
    owner = _UserMinimalSerializer(source="owner_fk", read_only=True)

    # Computed from stage flags
    is_won = serializers.SerializerMethodField()
    is_lost = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            "id",
            "name",
            "amount",
            "currency",
            "close_date",
            "pipeline_id",
            "pipeline",
            "stage_id",
            "stage",
            "company_id",
            "company",
            "primary_contact_id",
            "primary_contact",
            "owner_id",
            "owner",
            "probability",
            "is_won",
            "is_lost",
            "is_deleted",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_deleted", "created_at", "updated_at"]

    def get_is_won(self, obj):
        return obj.stage.is_won if obj.stage_id else False

    def get_is_lost(self, obj):
        return obj.stage.is_lost if obj.stage_id else False

    def validate_amount(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Amount must be zero or a positive value.")
        return value

    def validate_probability(self, value):
        if value is not None and not (0 <= value <= 100):
            raise serializers.ValidationError("Probability must be between 0 and 100.")
        return value

    def validate(self, attrs):
        # Resolve stage and pipeline — use instance values for PATCH where fields may be absent
        stage = attrs.get("stage") or (self.instance and self.instance.stage)
        pipeline = attrs.get("pipeline") or (self.instance and self.instance.pipeline)

        # Auto-set probability from stage when stage changes and user did not supply probability
        if "stage" in attrs and "probability" not in self.initial_data:
            if attrs["stage"] is not None:
                attrs["probability"] = attrs["stage"].probability

        # Stage must belong to the selected pipeline
        if stage and pipeline and stage.pipeline_id != pipeline.id:
            raise serializers.ValidationError(
                {"stage": "Stage does not belong to the selected pipeline."}
            )

        return attrs
