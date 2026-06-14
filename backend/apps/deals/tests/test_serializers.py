import pytest

from apps.deals.serializers import DealSerializer
from apps.deals.tests.factories import DealFactory, PipelineFactory, StageFactory


@pytest.mark.django_db
class TestDealSerializerValidate:
    def _make_pipeline_with_stages(self):
        pipeline = PipelineFactory()
        stage_a = StageFactory(pipeline=pipeline, order_index=1, probability=25, is_won=False, is_lost=False)
        stage_b = StageFactory(pipeline=pipeline, order_index=2, probability=75, is_won=True, is_lost=False)
        other_pipeline = PipelineFactory()
        other_stage = StageFactory(pipeline=other_pipeline, order_index=1, probability=50)
        return pipeline, stage_a, stage_b, other_pipeline, other_stage

    def test_probability_auto_set_from_stage(self):
        pipeline, stage_a, _, _, _ = self._make_pipeline_with_stages()
        data = {"name": "Test", "pipeline_id": pipeline.id, "stage_id": stage_a.id}
        s = DealSerializer(data=data)
        assert s.is_valid(), s.errors
        assert s.validated_data["probability"] == 25

    def test_user_probability_wins_over_stage(self):
        pipeline, stage_a, _, _, _ = self._make_pipeline_with_stages()
        data = {"name": "Test", "pipeline_id": pipeline.id, "stage_id": stage_a.id, "probability": 10}
        s = DealSerializer(data=data)
        assert s.is_valid(), s.errors
        assert s.validated_data["probability"] == 10

    def test_stage_pipeline_mismatch_raises(self):
        pipeline, _, _, other_pipeline, other_stage = self._make_pipeline_with_stages()
        data = {"name": "Test", "pipeline_id": pipeline.id, "stage_id": other_stage.id}
        s = DealSerializer(data=data)
        assert not s.is_valid()
        assert "stage" in str(s.errors)

    def test_validate_amount_rejects_negative(self):
        data = {"name": "Test", "amount": -1}
        s = DealSerializer(data=data)
        assert not s.is_valid()
        assert "amount" in s.errors

    def test_validate_probability_rejects_over_100(self):
        data = {"name": "Test", "probability": 101}
        s = DealSerializer(data=data)
        assert not s.is_valid()
        assert "probability" in s.errors

    def test_get_is_won_true_when_stage_is_won(self):
        pipeline, _, stage_won, _, _ = self._make_pipeline_with_stages()
        deal = DealFactory(pipeline=pipeline, stage=stage_won)
        s = DealSerializer(deal)
        assert s.data["is_won"] is True
        assert s.data["is_lost"] is False

    def test_get_is_lost_true_when_stage_is_lost(self):
        pipeline = PipelineFactory()
        stage_lost = StageFactory(pipeline=pipeline, order_index=1, probability=0, is_won=False, is_lost=True)
        deal = DealFactory(pipeline=pipeline, stage=stage_lost)
        s = DealSerializer(deal)
        assert s.data["is_won"] is False
        assert s.data["is_lost"] is True

    def test_is_won_false_when_no_stage(self):
        deal = DealFactory(stage=None, pipeline=None)
        s = DealSerializer(deal)
        assert s.data["is_won"] is False
        assert s.data["is_lost"] is False

    def test_patch_stage_only_auto_sets_probability_with_instance_fallback(self):
        pipeline, stage_a, stage_b, _, _ = self._make_pipeline_with_stages()
        deal = DealFactory(pipeline=pipeline, stage=stage_a, probability=25)
        # PATCH with only stage_id — pipeline absent from payload, should use instance.pipeline
        data = {"stage_id": stage_b.id}
        s = DealSerializer(deal, data=data, partial=True)
        assert s.is_valid(), s.errors
        assert s.validated_data["probability"] == 75
