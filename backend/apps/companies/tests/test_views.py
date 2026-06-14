import pytest
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.companies.models import Company
from apps.companies.tests.factories import CompanyFactory

LIST_URL = "/api/companies/"


def detail_url(pk):
    return f"/api/companies/{pk}/"


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
class TestCompanyAuth:
    def test_list_requires_auth(self, anon_client):
        response = anon_client.get(LIST_URL)
        assert response.status_code == 401

    def test_create_requires_auth(self, anon_client):
        response = anon_client.post(LIST_URL, {"name": "Acme"}, format="json")
        assert response.status_code == 401

    def test_retrieve_requires_auth(self, anon_client):
        company = CompanyFactory()
        response = anon_client.get(detail_url(company.pk))
        assert response.status_code == 401

    def test_update_requires_auth(self, anon_client):
        company = CompanyFactory()
        response = anon_client.put(detail_url(company.pk), {"name": "X"}, format="json")
        assert response.status_code == 401

    def test_delete_requires_auth(self, anon_client):
        company = CompanyFactory()
        response = anon_client.delete(detail_url(company.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# List
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCompanyList:
    def test_list_returns_only_alive_companies(self, auth_client):
        client, _ = auth_client
        alive = CompanyFactory()
        deleted = CompanyFactory()
        deleted.delete()

        response = client.get(LIST_URL)
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert alive.pk in ids
        assert deleted.pk not in ids

    def test_list_response_has_pagination_shape(self, auth_client):
        client, _ = auth_client
        CompanyFactory.create_batch(3)

        response = client.get(LIST_URL)
        data = response.json()
        assert "count" in data
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_search_q_filters_by_name(self, auth_client):
        client, _ = auth_client
        match = CompanyFactory(name="UniqueSearchTerm Corp")
        other = CompanyFactory(name="SomethingElse Ltd")

        response = client.get(LIST_URL, {"q": "UniqueSearchTerm"})
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_industry_filter(self, auth_client):
        client, _ = auth_client
        match = CompanyFactory(industry="Technology")
        other = CompanyFactory(industry="Finance")

        response = client.get(LIST_URL, {"industry": "Technology"})
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_ordering_by_name_ascending(self, auth_client):
        client, _ = auth_client
        CompanyFactory(name="Zebra Inc")
        CompanyFactory(name="Apple Co")

        response = client.get(LIST_URL, {"ordering": "name"})
        assert response.status_code == 200
        names = [r["name"] for r in response.json()["results"]]
        assert names == sorted(names)

    def test_ordering_by_name_descending(self, auth_client):
        client, _ = auth_client
        CompanyFactory(name="Zebra Inc")
        CompanyFactory(name="Apple Co")

        response = client.get(LIST_URL, {"ordering": "-name"})
        assert response.status_code == 200
        names = [r["name"] for r in response.json()["results"]]
        assert names == sorted(names, reverse=True)


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCompanyCreate:
    def test_post_creates_company_and_returns_201(self, auth_client):
        client, user = auth_client
        payload = {"name": "New Corp", "industry": "Tech"}

        response = client.post(LIST_URL, payload, format="json")
        assert response.status_code == 201
        assert Company.objects.filter(name="New Corp").exists()

    def test_post_sets_created_by_to_current_user(self, auth_client):
        client, user = auth_client
        response = client.post(LIST_URL, {"name": "My Corp"}, format="json")
        assert response.status_code == 201
        company = Company.objects.get(name="My Corp")
        assert company.created_by == user

    def test_post_with_blank_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"name": ""}, format="json")
        assert response.status_code == 400

    def test_post_with_negative_revenue_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(
            LIST_URL, {"name": "Corp", "annual_revenue": "-100.00"}, format="json"
        )
        assert response.status_code == 400


# ---------------------------------------------------------------------------
# Retrieve
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCompanyRetrieve:
    def test_get_returns_company_fields(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory(name="Readable Corp")

        response = client.get(detail_url(company.pk))
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == company.pk
        assert data["name"] == "Readable Corp"

    def test_get_soft_deleted_returns_404(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()
        company.delete()

        response = client.get(detail_url(company.pk))
        assert response.status_code == 404

    def test_get_nonexistent_id_returns_404(self, auth_client):
        client, _ = auth_client
        response = client.get(detail_url(99999))
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# Update (PUT / PATCH)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCompanyUpdate:
    def test_put_full_update_returns_200(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()
        payload = {
            "name": "Updated Corp",
            "industry": "",
            "website": "",
            "phone": "",
            "billing_address": "",
            "shipping_address": "",
            "annual_revenue": None,
            "employee_count": None,
            "owner": None,
        }

        response = client.put(detail_url(company.pk), payload, format="json")
        assert response.status_code == 200
        company.refresh_from_db()
        assert company.name == "Updated Corp"

    def test_patch_partial_update_returns_200(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory(name="Old Name")

        response = client.patch(
            detail_url(company.pk), {"name": "New Name"}, format="json"
        )
        assert response.status_code == 200
        company.refresh_from_db()
        assert company.name == "New Name"

    def test_put_advances_updated_at(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()
        original_updated_at = company.updated_at

        payload = {
            "name": company.name + " Updated",
            "industry": "",
            "website": "",
            "phone": "",
            "billing_address": "",
            "shipping_address": "",
            "annual_revenue": None,
            "employee_count": None,
            "owner": None,
        }
        client.put(detail_url(company.pk), payload, format="json")
        company.refresh_from_db()
        assert company.updated_at > original_updated_at


# ---------------------------------------------------------------------------
# Delete
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestCompanyDelete:
    def test_delete_returns_204(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()

        response = client.delete(detail_url(company.pk))
        assert response.status_code == 204

    def test_delete_sets_is_deleted_true(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()

        client.delete(detail_url(company.pk))
        company.refresh_from_db()
        assert company.is_deleted is True

    def test_delete_sets_deleted_at(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()

        client.delete(detail_url(company.pk))
        company.refresh_from_db()
        assert company.deleted_at is not None

    def test_deleted_company_absent_from_list(self, auth_client):
        client, _ = auth_client
        company = CompanyFactory()

        client.delete(detail_url(company.pk))
        response = client.get(LIST_URL)
        ids = [r["id"] for r in response.json()["results"]]
        assert company.pk not in ids
