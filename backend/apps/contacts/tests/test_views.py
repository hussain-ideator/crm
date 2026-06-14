import pytest
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.contacts.models import Contact
from apps.contacts.tests.factories import ContactFactory

LIST_URL = "/api/contacts/"


def detail_url(pk):
    return f"/api/contacts/{pk}/"


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
# Authentication (US1-US3)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactAuth:
    def test_list_requires_auth(self, anon_client):
        response = anon_client.get(LIST_URL)
        assert response.status_code == 401

    def test_create_requires_auth(self, anon_client):
        response = anon_client.post(LIST_URL, {"first_name": "A", "last_name": "B"}, format="json")
        assert response.status_code == 401

    def test_retrieve_requires_auth(self, anon_client):
        contact = ContactFactory()
        response = anon_client.get(detail_url(contact.pk))
        assert response.status_code == 401

    def test_update_requires_auth(self, anon_client):
        contact = ContactFactory()
        response = anon_client.patch(detail_url(contact.pk), {"last_name": "X"}, format="json")
        assert response.status_code == 401

    def test_delete_requires_auth(self, anon_client):
        contact = ContactFactory()
        response = anon_client.delete(detail_url(contact.pk))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# List (US1)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactList:
    def test_list_returns_only_alive_contacts(self, auth_client):
        client, _ = auth_client
        alive = ContactFactory()
        deleted = ContactFactory()
        deleted.delete()

        response = client.get(LIST_URL)
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert alive.pk in ids
        assert deleted.pk not in ids

    def test_list_response_has_pagination_shape(self, auth_client):
        client, _ = auth_client
        ContactFactory.create_batch(3)

        response = client.get(LIST_URL)
        data = response.json()
        assert "count" in data
        assert "results" in data
        assert isinstance(data["results"], list)

    def test_search_q_matches_first_name(self, auth_client):
        client, _ = auth_client
        match = ContactFactory(first_name="Xantippe", last_name="Smith")
        other = ContactFactory(first_name="Bob", last_name="Jones")

        response = client.get(LIST_URL, {"q": "Xantippe"})
        assert response.status_code == 200
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_search_q_matches_email(self, auth_client):
        client, _ = auth_client
        match = ContactFactory(email="uniquetoken@example.com")
        other = ContactFactory(email="other@example.com")

        response = client.get(LIST_URL, {"q": "uniquetoken"})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_company_filter(self, auth_client):
        client, _ = auth_client
        match = ContactFactory()
        other = ContactFactory()

        response = client.get(LIST_URL, {"company": match.company_fk.pk})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_owner_filter(self, auth_client):
        client, _ = auth_client
        match = ContactFactory()
        other = ContactFactory()

        response = client.get(LIST_URL, {"owner": match.owner_fk.pk})
        ids = [r["id"] for r in response.json()["results"]]
        assert match.pk in ids
        assert other.pk not in ids

    def test_ordering_by_last_name_ascending(self, auth_client):
        client, _ = auth_client
        ContactFactory(last_name="Zebra")
        ContactFactory(last_name="Apple")

        response = client.get(LIST_URL, {"ordering": "last_name"})
        assert response.status_code == 200
        names = [r["last_name"] for r in response.json()["results"]]
        assert names == sorted(names)

    def test_ordering_by_last_name_descending(self, auth_client):
        client, _ = auth_client
        ContactFactory(last_name="Zebra")
        ContactFactory(last_name="Apple")

        response = client.get(LIST_URL, {"ordering": "-last_name"})
        names = [r["last_name"] for r in response.json()["results"]]
        assert names == sorted(names, reverse=True)

    def test_nested_company_in_list_response(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        response = client.get(LIST_URL)
        result = next(r for r in response.json()["results"] if r["id"] == contact.pk)
        assert result["company"]["id"] == contact.company_fk.pk
        assert result["company"]["name"] == contact.company_fk.name


# ---------------------------------------------------------------------------
# Create (US2)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactCreate:
    def test_post_creates_contact_and_returns_201(self, auth_client):
        client, user = auth_client
        payload = {"first_name": "Jane", "last_name": "Doe"}

        response = client.post(LIST_URL, payload, format="json")
        assert response.status_code == 201
        assert Contact.objects.filter(first_name="Jane", last_name="Doe").exists()

    def test_post_sets_created_by_to_current_user(self, auth_client):
        client, user = auth_client
        response = client.post(LIST_URL, {"first_name": "Jane", "last_name": "Doe"}, format="json")
        assert response.status_code == 201
        contact = Contact.objects.get(first_name="Jane", last_name="Doe")
        assert contact.created_by == user

    def test_post_missing_first_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"last_name": "Doe"}, format="json")
        assert response.status_code == 400

    def test_post_missing_last_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"first_name": "Jane"}, format="json")
        assert response.status_code == 400

    def test_post_without_email_succeeds(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"first_name": "No", "last_name": "Email"}, format="json")
        assert response.status_code == 201
        contact = Contact.objects.get(first_name="No", last_name="Email")
        assert contact.email == ""

    def test_post_with_company_links_contact(self, auth_client):
        from apps.companies.tests.factories import CompanyFactory
        client, _ = auth_client
        company = CompanyFactory()
        response = client.post(
            LIST_URL,
            {"first_name": "Jane", "last_name": "Doe", "company_id": company.pk},
            format="json",
        )
        assert response.status_code == 201
        contact = Contact.objects.get(first_name="Jane", last_name="Doe")
        assert contact.company_fk == company


# ---------------------------------------------------------------------------
# Retrieve (US3)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactRetrieve:
    def test_get_returns_contact_fields(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory(first_name="Alice", last_name="Wonder")

        response = client.get(detail_url(contact.pk))
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == contact.pk
        assert data["first_name"] == "Alice"
        assert data["last_name"] == "Wonder"

    def test_get_soft_deleted_returns_404(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()
        contact.delete()

        response = client.get(detail_url(contact.pk))
        assert response.status_code == 404

    def test_get_nonexistent_returns_404(self, auth_client):
        client, _ = auth_client
        response = client.get(detail_url(99999))
        assert response.status_code == 404

    def test_company_link_in_detail_response(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        response = client.get(detail_url(contact.pk))
        data = response.json()
        assert data["company"]["id"] == contact.company_fk.pk
        assert data["company"]["name"] == contact.company_fk.name


# ---------------------------------------------------------------------------
# Update (US4)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactUpdate:
    def test_patch_updates_fields_and_returns_200(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory(last_name="Old", title="")

        response = client.patch(
            detail_url(contact.pk),
            {"last_name": "New", "title": "Director"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["last_name"] == "New"
        assert data["title"] == "Director"

    def test_patch_preserves_unchanged_fields(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory(first_name="Alice", last_name="Smith")

        client.patch(detail_url(contact.pk), {"last_name": "Jones"}, format="json")

        contact.refresh_from_db()
        assert contact.first_name == "Alice"
        assert contact.last_name == "Jones"

    def test_patch_soft_deleted_returns_404(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()
        contact.delete()

        response = client.patch(detail_url(contact.pk), {"last_name": "X"}, format="json")
        assert response.status_code == 404

    def test_put_replaces_contact_and_returns_200(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        response = client.put(
            detail_url(contact.pk),
            {"first_name": "Bob", "last_name": "Builder"},
            format="json",
        )
        assert response.status_code == 200
        assert response.json()["first_name"] == "Bob"

    def test_patch_with_company_id_updates_company_fk(self, auth_client):
        from apps.companies.tests.factories import CompanyFactory
        client, _ = auth_client
        contact = ContactFactory()
        new_company = CompanyFactory()

        response = client.patch(
            detail_url(contact.pk), {"company_id": new_company.pk}, format="json"
        )
        assert response.status_code == 200
        contact.refresh_from_db()
        assert contact.company_fk == new_company


# ---------------------------------------------------------------------------
# Destroy (US5)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestContactDestroy:
    def test_delete_returns_204(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        response = client.delete(detail_url(contact.pk))
        assert response.status_code == 204

    def test_delete_soft_deletes_the_record(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        client.delete(detail_url(contact.pk))

        contact.refresh_from_db()
        assert contact.is_deleted is True
        assert contact.deleted_at is not None

    def test_deleted_contact_not_in_list(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()

        client.delete(detail_url(contact.pk))

        response = client.get(LIST_URL)
        ids = [r["id"] for r in response.json()["results"]]
        assert contact.pk not in ids

    def test_delete_soft_deleted_contact_returns_404(self, auth_client):
        client, _ = auth_client
        contact = ContactFactory()
        contact.delete()

        response = client.delete(detail_url(contact.pk))
        assert response.status_code == 404
