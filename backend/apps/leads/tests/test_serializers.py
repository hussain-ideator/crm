import pytest

from apps.leads.serializers import LeadSerializer
from apps.leads.tests.factories import LeadSourceFactory


@pytest.mark.django_db
class TestLeadSerializerValidation:
    def _get_base_data(self, **overrides):
        return {"first_name": "John", "last_name": "Doe", **overrides}

    def test_validate_status_rejects_converted(self):
        data = self._get_base_data(status="converted")
        serializer = LeadSerializer(data=data)
        assert not serializer.is_valid()
        assert "status" in serializer.errors

    def test_validate_status_accepts_valid_statuses(self):
        for status in ["new", "contacted", "qualified", "unqualified"]:
            data = self._get_base_data(status=status)
            serializer = LeadSerializer(data=data)
            assert serializer.is_valid(), f"Expected valid for status={status}: {serializer.errors}"

    def test_validate_no_of_employees_rejects_negative(self):
        data = self._get_base_data(no_of_employees=-1)
        serializer = LeadSerializer(data=data)
        assert not serializer.is_valid()
        assert "no_of_employees" in serializer.errors

    def test_validate_no_of_employees_accepts_zero(self):
        data = self._get_base_data(no_of_employees=0)
        serializer = LeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_validate_no_of_employees_accepts_positive(self):
        data = self._get_base_data(no_of_employees=100)
        serializer = LeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_first_name_required(self):
        data = {"last_name": "Doe"}
        serializer = LeadSerializer(data=data)
        assert not serializer.is_valid()
        assert "first_name" in serializer.errors

    def test_last_name_required(self):
        data = {"first_name": "John"}
        serializer = LeadSerializer(data=data)
        assert not serializer.is_valid()
        assert "last_name" in serializer.errors

    def test_valid_minimal_data_passes(self):
        data = self._get_base_data()
        serializer = LeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_source_id_accepts_valid_source(self):
        source = LeadSourceFactory()
        data = self._get_base_data(source_id=source.pk)
        serializer = LeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors

    def test_source_id_accepts_null(self):
        data = self._get_base_data(source_id=None)
        serializer = LeadSerializer(data=data)
        assert serializer.is_valid(), serializer.errors
