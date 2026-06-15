import pytest
from django.contrib.contenttypes.models import ContentType
from django.apps import apps as django_apps

from apps.activities.models import Activity
from apps.activities.serializers import ActivitySerializer
from apps.activities.tests.factories import ActivityFactory
from apps.accounts.tests.factories import UserFactory


def _lead_ct():
    lead_model = django_apps.get_model("leads", "lead")
    return ContentType.objects.get_for_model(lead_model)


@pytest.mark.django_db
class TestActivitySerializerWrite:
    def test_content_type_label_resolves_to_content_type_fk(self):
        data = {"type": "task", "subject": "S", "content_type": "lead", "object_id": 1}
        s = ActivitySerializer(data=data)
        assert s.is_valid(), s.errors
        ct = s.validated_data["content_type"]
        assert ct == _lead_ct()

    def test_response_serializes_content_type_as_string_label(self):
        ct = _lead_ct()
        activity = ActivityFactory(content_type=ct, object_id=1)
        s = ActivitySerializer(activity)
        assert s.data["content_type"] == "lead"
        assert isinstance(s.data["content_type"], str)

    def test_content_type_none_object_id_none_is_valid(self):
        data = {"type": "task", "subject": "S", "content_type": None, "object_id": None}
        s = ActivitySerializer(data=data)
        assert s.is_valid(), s.errors

    def test_content_type_without_object_id_raises_pair_error(self):
        data = {"type": "task", "subject": "S", "content_type": "lead"}
        s = ActivitySerializer(data=data)
        assert not s.is_valid()
        err_str = str(s.errors)
        assert "both" in err_str.lower() or "pair" in err_str.lower() or "content_type" in err_str

    def test_object_id_without_content_type_raises_pair_error(self):
        data = {"type": "task", "subject": "S", "object_id": 1}
        s = ActivitySerializer(data=data)
        assert not s.is_valid()

    def test_nonexistent_object_id_with_valid_content_type_is_valid(self):
        """Decision 1: soft reference — no existence check."""
        data = {"type": "task", "subject": "S", "content_type": "lead", "object_id": 9999}
        s = ActivitySerializer(data=data)
        assert s.is_valid(), s.errors

    def test_all_activity_types_accepted(self):
        for t in ["task", "call", "meeting"]:
            data = {"type": t, "subject": "S"}
            s = ActivitySerializer(data=data)
            assert s.is_valid(), f"type={t} failed: {s.errors}"

    def test_invalid_type_raises_choice_error(self):
        data = {"type": "email", "subject": "S"}
        s = ActivitySerializer(data=data)
        assert not s.is_valid()
        assert "type" in s.errors

    def test_content_type_null_returned_as_none(self):
        activity = ActivityFactory(content_type=None, object_id=None)
        s = ActivitySerializer(activity)
        assert s.data["content_type"] is None
