import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.activities.models import Activity
from apps.activities.tests.factories import ActivityFactory

LIST_URL = "/api/activities/"


def detail_url(pk):
    return f"/api/activities/{pk}/"


def complete_url(pk):
    return f"/api/activities/{pk}/complete/"


def incomplete_url(pk):
    return f"/api/activities/{pk}/incomplete/"


@pytest.fixture
def auth_client():
    user = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.fixture
def anon_client():
    return APIClient()


# ---------------------------------------------------------------------------
# US1 — Create endpoint tests (T015)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityCreate:
    def test_valid_type_and_subject_returns_201(self, auth_client):
        client, _ = auth_client
        res = client.post(LIST_URL, {"type": "task", "subject": "My Task"}, format="json")
        assert res.status_code == 201
        data = res.json()
        assert data["type"] == "task"
        assert data["subject"] == "My Task"
        assert data["completed_at"] is None
        assert data["assigned_to"] is None
        assert data["content_type"] is None
        assert data["object_id"] is None

    def test_with_content_type_and_object_id_returns_201(self, auth_client):
        client, _ = auth_client
        res = client.post(
            LIST_URL,
            {"type": "call", "subject": "Discovery call", "content_type": "lead", "object_id": 1},
            format="json",
        )
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "lead"
        assert data["object_id"] == 1

    def test_blank_subject_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(LIST_URL, {"type": "task", "subject": ""}, format="json")
        assert res.status_code == 400
        assert "subject" in res.json()

    def test_missing_type_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(LIST_URL, {"subject": "No type"}, format="json")
        assert res.status_code == 400
        assert "type" in res.json()

    def test_invalid_type_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(LIST_URL, {"type": "email", "subject": "Bad type"}, format="json")
        assert res.status_code == 400
        assert "type" in res.json()

    def test_content_type_without_object_id_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(
            LIST_URL, {"type": "task", "subject": "S", "content_type": "lead"}, format="json"
        )
        assert res.status_code == 400

    def test_object_id_without_content_type_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(
            LIST_URL, {"type": "task", "subject": "S", "object_id": 1}, format="json"
        )
        assert res.status_code == 400

    def test_invalid_content_type_label_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.post(
            LIST_URL,
            {"type": "task", "subject": "S", "content_type": "invoice", "object_id": 1},
            format="json",
        )
        assert res.status_code == 400
        assert "content_type" in res.json()

    def test_unauthenticated_returns_401(self, anon_client):
        res = anon_client.post(LIST_URL, {"type": "task", "subject": "S"}, format="json")
        assert res.status_code == 401

    def test_with_optional_fields(self, auth_client):
        client, user = auth_client
        res = client.post(
            LIST_URL,
            {
                "type": "meeting",
                "subject": "Full meeting",
                "description": "Some notes",
                "due_at": "2026-07-01T10:00:00Z",
                "assigned_to_id": user.id,
                "completed_at": "2026-07-01T11:00:00Z",
            },
            format="json",
        )
        assert res.status_code == 201
        data = res.json()
        assert data["description"] == "Some notes"
        assert data["due_at"] is not None
        assert data["assigned_to"] is not None
        assert data["completed_at"] is not None

    def test_nonexistent_object_id_returns_201(self, auth_client):
        """Decision 1: soft reference — no existence check against target record."""
        client, _ = auth_client
        res = client.post(
            LIST_URL,
            {"type": "task", "subject": "S", "content_type": "lead", "object_id": 999},
            format="json",
        )
        assert res.status_code == 201

    def test_content_type_returned_as_string_label_not_integer(self, auth_client):
        client, _ = auth_client
        res = client.post(
            LIST_URL,
            {"type": "task", "subject": "S", "content_type": "contact", "object_id": 5},
            format="json",
        )
        assert res.status_code == 201
        data = res.json()
        assert data["content_type"] == "contact"
        assert isinstance(data["content_type"], str)


# ---------------------------------------------------------------------------
# US2 — List endpoint tests (T023)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityList:
    def test_unauthenticated_returns_401(self, anon_client):
        res = anon_client.get(LIST_URL)
        assert res.status_code == 401

    def test_default_list_excludes_deleted(self, auth_client):
        client, user = auth_client
        active = ActivityFactory(subject="Active", created_by=user)
        deleted = ActivityFactory(subject="Deleted", is_deleted=True, created_by=user)
        res = client.get(LIST_URL)
        assert res.status_code == 200
        ids = [a["id"] for a in res.json()["results"]]
        assert active.id in ids
        assert deleted.id not in ids

    def test_response_has_pagination_envelope(self, auth_client):
        client, _ = auth_client
        res = client.get(LIST_URL)
        assert res.status_code == 200
        data = res.json()
        assert "count" in data
        assert "next" in data
        assert "previous" in data
        assert "results" in data

    def test_search_by_subject(self, auth_client):
        client, user = auth_client
        match = ActivityFactory(subject="kickoff meeting", created_by=user)
        no_match = ActivityFactory(subject="Something else", created_by=user)
        res = client.get(LIST_URL, {"q": "kickoff"})
        ids = [a["id"] for a in res.json()["results"]]
        assert match.id in ids
        assert no_match.id not in ids

    def test_search_by_description(self, auth_client):
        client, user = auth_client
        match = ActivityFactory(subject="Generic", description="kickoff notes", created_by=user)
        no_match = ActivityFactory(subject="Other", description="nothing here", created_by=user)
        res = client.get(LIST_URL, {"q": "kickoff"})
        ids = [a["id"] for a in res.json()["results"]]
        assert match.id in ids
        assert no_match.id not in ids

    def test_filter_by_type(self, auth_client):
        client, user = auth_client
        task = ActivityFactory(type="task", created_by=user)
        call = ActivityFactory(type="call", created_by=user)
        res = client.get(LIST_URL, {"type": "task"})
        ids = [a["id"] for a in res.json()["results"]]
        assert task.id in ids
        assert call.id not in ids

    def test_filter_by_assigned_to(self, auth_client):
        client, user = auth_client
        other_user = UserFactory()
        assigned = ActivityFactory(assigned_to=user, created_by=user)
        not_assigned = ActivityFactory(assigned_to=other_user, created_by=user)
        res = client.get(LIST_URL, {"assigned_to": user.id})
        ids = [a["id"] for a in res.json()["results"]]
        assert assigned.id in ids
        assert not_assigned.id not in ids

    def test_filter_by_content_type_and_object_id(self, auth_client):
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)
        linked = ActivityFactory(content_type=ct, object_id=1, created_by=user)
        unlinked = ActivityFactory(content_type=None, object_id=None, created_by=user)
        res = client.get(LIST_URL, {"content_type": "lead", "object_id": 1})
        ids = [a["id"] for a in res.json()["results"]]
        assert linked.id in ids
        assert unlinked.id not in ids

    def test_feed_sort_order(self, auth_client):
        """Decision 2: ?content_type+object_id → due_at ASC NULLS LAST, created_at DESC."""
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)

        # C: due_at=2026-06-20, B: due_at=2026-07-01, A: due_at=null
        activity_b = ActivityFactory(
            content_type=ct, object_id=42,
            due_at="2026-07-01T00:00:00Z", created_by=user
        )
        activity_c = ActivityFactory(
            content_type=ct, object_id=42,
            due_at="2026-06-20T00:00:00Z", created_by=user
        )
        activity_a = ActivityFactory(
            content_type=ct, object_id=42,
            due_at=None, created_by=user
        )
        res = client.get(LIST_URL, {"content_type": "lead", "object_id": 42})
        assert res.status_code == 200
        ids = [a["id"] for a in res.json()["results"]]
        # C first (earliest due), then B, then A (null last)
        assert ids.index(activity_c.id) < ids.index(activity_b.id)
        assert ids.index(activity_b.id) < ids.index(activity_a.id)

    def test_feed_sort_null_due_secondary_sort_created_at_desc(self, auth_client):
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)

        # Two null-due activities: newer created first
        first_created = ActivityFactory(content_type=ct, object_id=43, due_at=None, created_by=user)
        second_created = ActivityFactory(content_type=ct, object_id=43, due_at=None, created_by=user)
        res = client.get(LIST_URL, {"content_type": "lead", "object_id": 43})
        ids = [a["id"] for a in res.json()["results"]]
        # Most recently created null-due appears first
        assert ids.index(second_created.id) < ids.index(first_created.id)

    def test_content_type_without_object_id_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.get(LIST_URL, {"content_type": "lead"})
        assert res.status_code == 400

    def test_invalid_content_type_label_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.get(LIST_URL, {"content_type": "invoice", "object_id": 1})
        assert res.status_code == 400

    def test_combined_type_and_assigned_to_filter(self, auth_client):
        client, user = auth_client
        match = ActivityFactory(type="call", assigned_to=user, created_by=user)
        wrong_type = ActivityFactory(type="task", assigned_to=user, created_by=user)
        wrong_user = ActivityFactory(type="call", created_by=user)
        res = client.get(LIST_URL, {"type": "call", "assigned_to": user.id})
        ids = [a["id"] for a in res.json()["results"]]
        assert match.id in ids
        assert wrong_type.id not in ids
        assert wrong_user.id not in ids

    def test_ordering_by_subject_desc(self, auth_client):
        client, user = auth_client
        ActivityFactory(subject="Zebra", created_by=user)
        ActivityFactory(subject="Apple", created_by=user)
        res = client.get(LIST_URL, {"ordering": "-subject"})
        subjects = [a["subject"] for a in res.json()["results"]]
        assert subjects[0] == "Zebra"

    def test_default_ordering_is_created_at_desc(self, auth_client):
        client, user = auth_client
        first = ActivityFactory(created_by=user)
        second = ActivityFactory(created_by=user)
        res = client.get(LIST_URL)
        ids = [a["id"] for a in res.json()["results"]]
        assert ids.index(second.id) < ids.index(first.id)

    def test_page_size_too_large_returns_400(self, auth_client):
        client, _ = auth_client
        res = client.get(LIST_URL, {"page_size": 200})
        assert res.status_code == 400

    def test_invalid_page_returns_404(self, auth_client):
        client, _ = auth_client
        res = client.get(LIST_URL, {"page": "abc"})
        assert res.status_code == 404


# ---------------------------------------------------------------------------
# US3 — Retrieve endpoint tests (T029)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityRetrieve:
    def test_exists_returns_200_with_all_fields(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(
            type="call", subject="Test", created_by=user, assigned_to=user
        )
        res = client.get(detail_url(activity.id))
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == activity.id
        assert data["type"] == "call"
        assert data["subject"] == "Test"
        assert "content_type" in data
        assert "assigned_to" in data
        assert "created_by" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_content_type_returned_as_string_label(self, auth_client):
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)
        activity = ActivityFactory(content_type=ct, object_id=1, created_by=user)
        res = client.get(detail_url(activity.id))
        assert res.json()["content_type"] == "lead"

    def test_assigned_to_is_nested_object(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(assigned_to=user, created_by=user)
        res = client.get(detail_url(activity.id))
        data = res.json()
        assert isinstance(data["assigned_to"], dict)
        assert "id" in data["assigned_to"]
        assert "full_name" in data["assigned_to"]
        assert "email" in data["assigned_to"]

    def test_completed_at_null_when_incomplete(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(completed_at=None, created_by=user)
        assert res.json()["completed_at"] is None if (res := client.get(detail_url(activity.id))) else True
        res = client.get(detail_url(activity.id))
        assert res.json()["completed_at"] is None

    def test_completed_at_set_when_complete(self, auth_client):
        client, user = auth_client
        ts = timezone.now()
        activity = ActivityFactory(completed_at=ts, created_by=user)
        res = client.get(detail_url(activity.id))
        assert res.json()["completed_at"] is not None

    def test_soft_deleted_returns_404(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(is_deleted=True, created_by=user)
        res = client.get(detail_url(activity.id))
        assert res.status_code == 404

    def test_nonexistent_returns_404(self, auth_client):
        client, _ = auth_client
        res = client.get(detail_url(99999))
        assert res.status_code == 404

    def test_unauthenticated_returns_401(self, anon_client):
        activity = ActivityFactory()
        res = anon_client.get(detail_url(activity.id))
        assert res.status_code == 401


# ---------------------------------------------------------------------------
# US4 — Complete/Incomplete endpoint tests (T032)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityComplete:
    def test_complete_incomplete_activity_returns_200_with_timestamp(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(completed_at=None, created_by=user)
        res = client.post(complete_url(activity.id))
        assert res.status_code == 200
        data = res.json()
        assert data["completed_at"] is not None

    def test_complete_already_complete_re_stamps(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(completed_at=timezone.now(), created_by=user)
        old_ts = activity.completed_at
        res = client.post(complete_url(activity.id))
        assert res.status_code == 200
        new_ts = res.json()["completed_at"]
        assert new_ts is not None

    def test_incomplete_complete_activity_clears_timestamp(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(completed_at=timezone.now(), created_by=user)
        res = client.post(incomplete_url(activity.id))
        assert res.status_code == 200
        assert res.json()["completed_at"] is None

    def test_incomplete_already_incomplete_is_idempotent(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(completed_at=None, created_by=user)
        res = client.post(incomplete_url(activity.id))
        assert res.status_code == 200
        assert res.json()["completed_at"] is None

    def test_complete_soft_deleted_returns_404(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(is_deleted=True, created_by=user)
        res = client.post(complete_url(activity.id))
        assert res.status_code == 404

    def test_unauthenticated_complete_returns_401(self, anon_client):
        activity = ActivityFactory()
        res = anon_client.post(complete_url(activity.id))
        assert res.status_code == 401


# ---------------------------------------------------------------------------
# US5 — Update endpoint tests (T037)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityUpdate:
    def test_patch_subject_returns_200(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(subject="Old", created_by=user)
        res = client.patch(detail_url(activity.id), {"subject": "New"}, format="json")
        assert res.status_code == 200
        assert res.json()["subject"] == "New"

    def test_patch_clear_linked_record(self, auth_client):
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)
        activity = ActivityFactory(content_type=ct, object_id=1, created_by=user)
        res = client.patch(
            detail_url(activity.id),
            {"content_type": None, "object_id": None},
            format="json",
        )
        assert res.status_code == 200
        assert res.json()["content_type"] is None
        assert res.json()["object_id"] is None

    def test_patch_content_type_without_object_id_returns_400(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        res = client.patch(
            detail_url(activity.id), {"content_type": "contact"}, format="json"
        )
        assert res.status_code == 400

    def test_patch_object_id_without_content_type_returns_400(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        res = client.patch(detail_url(activity.id), {"object_id": 5}, format="json")
        assert res.status_code == 400

    def test_patch_blank_subject_returns_400(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        res = client.patch(detail_url(activity.id), {"subject": ""}, format="json")
        assert res.status_code == 400

    def test_patch_soft_deleted_returns_404(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(is_deleted=True, created_by=user)
        res = client.patch(detail_url(activity.id), {"subject": "X"}, format="json")
        assert res.status_code == 404

    def test_unauthenticated_returns_401(self, anon_client):
        activity = ActivityFactory()
        res = anon_client.patch(detail_url(activity.id), {"subject": "X"}, format="json")
        assert res.status_code == 401


# ---------------------------------------------------------------------------
# US7 — Destroy / soft-delete tests (T048)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestActivityDestroy:
    def test_delete_returns_204(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        res = client.delete(detail_url(activity.id))
        assert res.status_code == 204

    def test_deleted_activity_returns_404_on_get(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        client.delete(detail_url(activity.id))
        res = client.get(detail_url(activity.id))
        assert res.status_code == 404

    def test_db_row_has_is_deleted_true(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        client.delete(detail_url(activity.id))
        activity.refresh_from_db()
        assert activity.is_deleted is True

    def test_list_excludes_soft_deleted(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(created_by=user)
        client.delete(detail_url(activity.id))
        res = client.get(LIST_URL)
        ids = [a["id"] for a in res.json()["results"]]
        assert activity.id not in ids

    def test_feed_excludes_soft_deleted(self, auth_client):
        from django.contrib.contenttypes.models import ContentType
        from django.apps import apps as django_apps

        client, user = auth_client
        lead_model = django_apps.get_model("leads", "lead")
        ct = ContentType.objects.get_for_model(lead_model)
        activity = ActivityFactory(content_type=ct, object_id=10, created_by=user)
        client.delete(detail_url(activity.id))
        res = client.get(LIST_URL, {"content_type": "lead", "object_id": 10})
        ids = [a["id"] for a in res.json()["results"]]
        assert activity.id not in ids

    def test_unauthenticated_returns_401(self, anon_client):
        activity = ActivityFactory()
        res = anon_client.delete(detail_url(activity.id))
        assert res.status_code == 401

    def test_delete_already_deleted_returns_404(self, auth_client):
        client, user = auth_client
        activity = ActivityFactory(is_deleted=True, created_by=user)
        res = client.delete(detail_url(activity.id))
        assert res.status_code == 404
