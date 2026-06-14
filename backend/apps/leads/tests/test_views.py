import pytest
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.leads.models import Lead, LeadStatus
from apps.leads.tests.factories import LeadFactory, LeadSourceFactory

LIST_URL = "/api/leads/"


def detail_url(pk):
    return f"/api/leads/{pk}/"


def convert_url(pk):
    return f"/api/leads/{pk}/convert/"


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
# Authentication
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadAuth:
    def test_list_requires_auth(self, anon_client):
        response = anon_client.get(LIST_URL)
        assert response.status_code == 401

    def test_create_requires_auth(self, anon_client):
        response = anon_client.post(
            LIST_URL, {"first_name": "John", "last_name": "Doe"}, format="json"
        )
        assert response.status_code == 401

    def test_retrieve_requires_auth(self, anon_client):
        lead = LeadFactory()
        response = anon_client.get(detail_url(lead.pk))
        assert response.status_code == 401

    def test_update_requires_auth(self, anon_client):
        lead = LeadFactory()
        response = anon_client.patch(detail_url(lead.pk), {"first_name": "X"}, format="json")
        assert response.status_code == 401

    def test_delete_requires_auth(self, anon_client):
        lead = LeadFactory()
        response = anon_client.delete(detail_url(lead.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US1 — List
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadList:
    def test_list_returns_only_non_deleted_leads(self, auth_client):
        client, _ = auth_client
        alive = LeadFactory()
        deleted = LeadFactory(is_deleted=True)

        response = client.get(LIST_URL)
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert alive.pk in ids
        assert deleted.pk not in ids

    def test_list_response_has_pagination_shape(self, auth_client):
        client, _ = auth_client
        LeadFactory.create_batch(3)

        response = client.get(LIST_URL)
        data = response.json()
        assert "count" in data
        assert "next" in data
        assert "previous" in data
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_default_order_is_created_at_desc(self, auth_client):
        client, _ = auth_client
        LeadFactory.create_batch(5)

        response = client.get(LIST_URL)
        assert response.status_code == 200
        results = response.json()["results"]
        dates = [r["created_at"] for r in results]
        assert dates == sorted(dates, reverse=True)

    def test_search_q_matches_first_name(self, auth_client):
        client, _ = auth_client
        match = LeadFactory(first_name="UniqueFirstName", last_name="Smith")
        other = LeadFactory(first_name="Other", last_name="Person")

        response = client.get(LIST_URL, {"q": "UniqueFirstName"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_search_q_matches_last_name(self, auth_client):
        client, _ = auth_client
        match = LeadFactory(first_name="John", last_name="UniqueLastName")
        other = LeadFactory(first_name="Jane", last_name="Doe")

        response = client.get(LIST_URL, {"q": "UniqueLastName"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_search_q_matches_email(self, auth_client):
        client, _ = auth_client
        match = LeadFactory(email="uniquematch@example.com")
        other = LeadFactory(email="other@example.com")

        response = client.get(LIST_URL, {"q": "uniquematch"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_search_q_matches_company_name(self, auth_client):
        client, _ = auth_client
        match = LeadFactory(company_name="UniqueCompanyCo")
        other = LeadFactory(company_name="OtherCorp")

        response = client.get(LIST_URL, {"q": "UniqueCompanyCo"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_search_q_matches_phone(self, auth_client):
        client, _ = auth_client
        match = LeadFactory(phone="555-UNIQUE")
        other = LeadFactory(phone="555-OTHER")

        response = client.get(LIST_URL, {"q": "555-UNIQUE"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_empty_q_returns_all_leads(self, auth_client):
        client, _ = auth_client
        LeadFactory.create_batch(3)

        response = client.get(LIST_URL, {"q": ""})
        assert response.status_code == 200
        assert response.json()["count"] == 3

    def test_status_filter(self, auth_client):
        client, _ = auth_client
        new_lead = LeadFactory(status=LeadStatus.NEW)
        contacted_lead = LeadFactory(status=LeadStatus.CONTACTED)

        response = client.get(LIST_URL, {"status": "new"})
        ids = [r["id"] for r in response.json()["results"]]
        assert new_lead.pk in ids
        assert contacted_lead.pk not in ids

    def test_source_filter(self, auth_client):
        client, _ = auth_client
        source1 = LeadSourceFactory()
        source2 = LeadSourceFactory()
        match = LeadFactory(source_fk=source1)
        other = LeadFactory(source_fk=source2)

        response = client.get(LIST_URL, {"source": source1.pk})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_owner_filter(self, auth_client):
        client, _ = auth_client
        owner1 = UserFactory()
        owner2 = UserFactory()
        match = LeadFactory(owner_fk=owner1)
        other = LeadFactory(owner_fk=owner2)

        response = client.get(LIST_URL, {"owner": owner1.pk})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_combined_filters(self, auth_client):
        client, _ = auth_client
        owner = UserFactory()
        source = LeadSourceFactory()
        match = LeadFactory(status=LeadStatus.QUALIFIED, owner_fk=owner, source_fk=source)
        other_status = LeadFactory(status=LeadStatus.NEW, owner_fk=owner, source_fk=source)

        response = client.get(
            LIST_URL, {"status": "qualified", "owner": owner.pk, "source": source.pk}
        )
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other_status.pk not in ids

    def test_ordering_by_first_name_asc(self, auth_client):
        client, _ = auth_client
        LeadFactory(first_name="Zebra")
        LeadFactory(first_name="Apple")

        response = client.get(LIST_URL, {"ordering": "first_name"})
        assert response.status_code == 200
        names = [r["first_name"] for r in response.json()["results"]]
        assert names == sorted(names)

    def test_ordering_by_first_name_desc(self, auth_client):
        client, _ = auth_client
        LeadFactory(first_name="Zebra")
        LeadFactory(first_name="Apple")

        response = client.get(LIST_URL, {"ordering": "-first_name"})
        assert response.status_code == 200
        names = [r["first_name"] for r in response.json()["results"]]
        assert names == sorted(names, reverse=True)

    def test_pagination_count_next_previous(self, auth_client):
        client, _ = auth_client
        LeadFactory.create_batch(5)

        response = client.get(LIST_URL, {"page_size": 2, "page": 1})
        data = response.json()
        assert data["count"] == 5
        assert data["next"] is not None
        assert data["previous"] is None

        response2 = client.get(LIST_URL, {"page_size": 2, "page": 2})
        data2 = response2.json()
        assert data2["previous"] is not None

    def test_page_size_over_100_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL, {"page_size": 200})
        assert response.status_code == 400

    def test_non_integer_page_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL, {"page": "abc"})
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# US2 — Create
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadCreate:
    def test_valid_minimal_payload_returns_201_with_status_new(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"first_name": "John", "last_name": "Doe"}, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "new"
        assert Lead.objects.filter(first_name="John", last_name="Doe").exists()

    def test_blank_first_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"first_name": "", "last_name": "Doe"}, format="json")
        assert response.status_code == 400

    def test_blank_last_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"first_name": "John", "last_name": ""}, format="json")
        assert response.status_code == 400

    def test_create_with_source_links_source(self, auth_client):
        client, _ = auth_client
        source = LeadSourceFactory()
        response = client.post(
            LIST_URL,
            {"first_name": "Jane", "last_name": "Smith", "source_id": source.pk},
            format="json",
        )
        assert response.status_code == 201
        lead = Lead.objects.get(pk=response.json()["id"])
        assert lead.source_fk_id == source.pk

    def test_status_converted_via_post_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(
            LIST_URL,
            {"first_name": "John", "last_name": "Doe", "status": "converted"},
            format="json",
        )
        assert response.status_code == 400

    def test_created_by_set_to_request_user(self, auth_client):
        client, user = auth_client
        response = client.post(LIST_URL, {"first_name": "John", "last_name": "Doe"}, format="json")
        assert response.status_code == 201
        lead = Lead.objects.get(pk=response.json()["id"])
        assert lead.created_by == user


# ---------------------------------------------------------------------------
# US3 — Retrieve
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadRetrieve:
    def test_existing_lead_returns_200_with_all_fields(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(email="test@example.com", company_name="Acme")

        response = client.get(detail_url(lead.pk))
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == lead.pk
        assert data["first_name"] == lead.first_name
        assert data["last_name"] == lead.last_name
        assert data["email"] == "test@example.com"
        assert data["company_name"] == "Acme"
        assert "status" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_soft_deleted_lead_returns_404(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(is_deleted=True)
        response = client.get(detail_url(lead.pk))
        assert response.status_code == 404

    def test_non_existent_lead_returns_404(self, auth_client):
        client, _ = auth_client
        response = client.get(detail_url(99999))
        assert response.status_code == 404

    def test_unauthenticated_returns_401(self, anon_client):
        lead = LeadFactory()
        response = anon_client.get(detail_url(lead.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US4 — Update
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadUpdate:
    def test_valid_patch_returns_200_with_updated_fields(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)

        response = client.patch(detail_url(lead.pk), {"status": "contacted"}, format="json")
        assert response.status_code == 200
        assert response.json()["status"] == "contacted"
        lead.refresh_from_db()
        assert lead.status == LeadStatus.CONTACTED

    def test_valid_put_returns_200(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory()

        response = client.put(
            detail_url(lead.pk),
            {"first_name": "Updated", "last_name": "Name"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["first_name"] == "Updated"

    def test_converted_lead_patch_returns_403(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.CONVERTED)

        response = client.patch(detail_url(lead.pk), {"first_name": "X"}, format="json")
        assert response.status_code == 403

    def test_converted_lead_put_returns_403(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.CONVERTED)

        response = client.put(
            detail_url(lead.pk),
            {"first_name": "X", "last_name": "Y"},
            format="json",
        )
        assert response.status_code == 403

    def test_status_converted_via_patch_returns_400(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)

        response = client.patch(detail_url(lead.pk), {"status": "converted"}, format="json")
        assert response.status_code == 400

    def test_clear_first_name_via_patch_returns_400(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory()

        response = client.patch(detail_url(lead.pk), {"first_name": ""}, format="json")
        assert response.status_code == 400

    def test_unauthenticated_patch_returns_401(self, anon_client):
        lead = LeadFactory()
        response = anon_client.patch(detail_url(lead.pk), {"first_name": "X"}, format="json")
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US5 — Convert
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadConvert:
    def test_convert_non_converted_lead_returns_200_and_status_converted(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)

        response = client.post(convert_url(lead.pk))
        assert response.status_code == 200
        assert response.json()["status"] == "converted"
        lead.refresh_from_db()
        assert lead.status == LeadStatus.CONVERTED

    @pytest.mark.xfail(reason="deals app not yet installed — unblock when 0003 migration lands")
    def test_convert_deal_link_in_response(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)

        response = client.post(convert_url(lead.pk))
        assert response.status_code == 200
        data = response.json()
        assert "converted_deal_fk" in data
        assert data["converted_deal_fk"] is not None
        assert "id" in data["converted_deal_fk"]

    def test_convert_already_converted_returns_400(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.CONVERTED)

        response = client.post(convert_url(lead.pk))
        assert response.status_code == 400

    def test_convert_soft_deleted_lead_returns_404(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(is_deleted=True)

        response = client.post(convert_url(lead.pk))
        assert response.status_code == 404

    def test_convert_unauthenticated_returns_401(self, anon_client):
        lead = LeadFactory(status=LeadStatus.NEW)
        response = anon_client.post(convert_url(lead.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US6 — Soft Delete
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadDestroy:
    def test_non_converted_delete_returns_204_and_sets_is_deleted(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)

        response = client.delete(detail_url(lead.pk))
        assert response.status_code == 204
        lead.refresh_from_db()
        assert lead.is_deleted is True

    def test_deleted_lead_subsequent_get_returns_404(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.NEW)
        client.delete(detail_url(lead.pk))

        response = client.get(detail_url(lead.pk))
        assert response.status_code == 404

    def test_converted_lead_delete_returns_403(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(status=LeadStatus.CONVERTED)

        response = client.delete(detail_url(lead.pk))
        assert response.status_code == 403

    def test_soft_deleted_lead_delete_returns_404(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory(is_deleted=True)

        response = client.delete(detail_url(lead.pk))
        assert response.status_code == 404

    def test_unauthenticated_delete_returns_401(self, anon_client):
        lead = LeadFactory()
        response = anon_client.delete(detail_url(lead.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# Polish — Edge Cases (T051)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestLeadEdgeCases:
    def test_no_of_employees_negative_via_post_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(
            LIST_URL,
            {"first_name": "John", "last_name": "Doe", "no_of_employees": -1},
            format="json",
        )
        assert response.status_code == 400

    def test_no_of_employees_negative_via_patch_returns_400(self, auth_client):
        client, _ = auth_client
        lead = LeadFactory()
        response = client.patch(detail_url(lead.pk), {"no_of_employees": -1}, format="json")
        assert response.status_code == 400

    def test_q_with_special_chars_returns_200(self, auth_client):
        client, _ = auth_client
        LeadFactory(first_name="O'Brien", last_name="Test")
        response = client.get(LIST_URL, {"q": "O'Brien"})
        assert response.status_code == 200
        assert response.json()["count"] >= 1

    def test_page_abc_returns_404(self, auth_client):
        client, _ = auth_client
        LeadFactory()
        response = client.get(LIST_URL, {"page": "abc"})
        assert response.status_code == 404

    def test_page_size_over_100_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL, {"page_size": 200})
        assert response.status_code == 400

    def test_empty_q_returns_all_leads(self, auth_client):
        client, _ = auth_client
        LeadFactory.create_batch(3)
        response = client.get(LIST_URL, {"q": ""})
        assert response.status_code == 200
        assert response.json()["count"] == 3
