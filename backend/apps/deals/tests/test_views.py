import pytest
from rest_framework.test import APIClient

from apps.accounts.tests.factories import UserFactory
from apps.companies.tests.factories import CompanyFactory
from apps.deals.models import Deal
from apps.deals.tests.factories import DealFactory, PipelineFactory, StageFactory

LIST_URL = "/api/deals/"
PIPELINES_URL = "/api/pipelines/"


def detail_url(pk):
    return f"/api/deals/{pk}/"


@pytest.fixture
def auth_client():
    user = UserFactory()
    client = APIClient()
    client.force_authenticate(user=user)
    return client, user


@pytest.fixture
def anon_client():
    return APIClient()


@pytest.fixture
def seed_pipeline():
    """Return the seeded Sales Pipeline and its stages (created by 0002 migration)."""
    from apps.deals.models import Pipeline
    return Pipeline.objects.get(name="Sales Pipeline")


# ---------------------------------------------------------------------------
# US1 — List endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDealList:
    def test_unauthenticated_returns_401(self, anon_client):
        response = anon_client.get(LIST_URL)
        assert response.status_code == 401

    def test_authenticated_returns_200(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL)
        assert response.status_code == 200

    def test_excludes_soft_deleted_deals(self, auth_client):
        client, user = auth_client
        active = DealFactory(name="Active", created_by=user)
        deleted = DealFactory(name="Deleted", is_deleted=True, created_by=user)
        response = client.get(LIST_URL)
        ids = [d["id"] for d in response.json()["results"]]
        assert active.id in ids
        assert deleted.id not in ids

    def test_search_by_deal_name(self, auth_client):
        client, user = auth_client
        match = DealFactory(name="Acme Renewal", created_by=user)
        no_match = DealFactory(name="Other Deal", created_by=user)
        response = client.get(LIST_URL, {"q": "Acme"})
        ids = [d["id"] for d in response.json()["results"]]
        assert match.id in ids
        assert no_match.id not in ids

    def test_search_by_company_name(self, auth_client):
        client, user = auth_client
        company = CompanyFactory(name="Globex Corp", created_by=user)
        match = DealFactory(name="Some Deal", company_fk=company, created_by=user)
        no_match = DealFactory(name="Other Deal", created_by=user)
        response = client.get(LIST_URL, {"q": "Globex"})
        ids = [d["id"] for d in response.json()["results"]]
        assert match.id in ids
        assert no_match.id not in ids

    def test_filter_by_stage(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage_a = StageFactory(pipeline=pipeline, order_index=1)
        stage_b = StageFactory(pipeline=pipeline, order_index=2)
        in_stage = DealFactory(pipeline=pipeline, stage=stage_a, created_by=user)
        not_in_stage = DealFactory(pipeline=pipeline, stage=stage_b, created_by=user)
        response = client.get(LIST_URL, {"stage": stage_a.id})
        ids = [d["id"] for d in response.json()["results"]]
        assert in_stage.id in ids
        assert not_in_stage.id not in ids

    def test_filter_by_pipeline(self, auth_client):
        client, user = auth_client
        pipeline_a = PipelineFactory()
        pipeline_b = PipelineFactory()
        in_pipeline = DealFactory(pipeline=pipeline_a, created_by=user)
        not_in_pipeline = DealFactory(pipeline=pipeline_b, created_by=user)
        response = client.get(LIST_URL, {"pipeline": pipeline_a.id})
        ids = [d["id"] for d in response.json()["results"]]
        assert in_pipeline.id in ids
        assert not_in_pipeline.id not in ids

    def test_filter_by_owner(self, auth_client):
        client, user = auth_client
        other_user = UserFactory()
        mine = DealFactory(owner_fk=user, created_by=user)
        theirs = DealFactory(owner_fk=other_user, created_by=user)
        response = client.get(LIST_URL, {"owner": user.id})
        ids = [d["id"] for d in response.json()["results"]]
        assert mine.id in ids
        assert theirs.id not in ids

    def test_filter_by_company(self, auth_client):
        client, user = auth_client
        company = CompanyFactory(created_by=user)
        with_company = DealFactory(company_fk=company, created_by=user)
        without_company = DealFactory(created_by=user)
        response = client.get(LIST_URL, {"company": company.id})
        ids = [d["id"] for d in response.json()["results"]]
        assert with_company.id in ids
        assert without_company.id not in ids

    def test_combined_filters_and_logic(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1)
        match = DealFactory(pipeline=pipeline, stage=stage, owner_fk=user, created_by=user)
        wrong_stage = DealFactory(pipeline=pipeline, created_by=user)
        wrong_owner = DealFactory(pipeline=pipeline, stage=stage, created_by=user)
        response = client.get(LIST_URL, {"stage": stage.id, "owner": user.id})
        ids = [d["id"] for d in response.json()["results"]]
        assert match.id in ids
        assert wrong_stage.id not in ids
        assert wrong_owner.id not in ids

    def test_ordering_by_name_ascending(self, auth_client):
        client, user = auth_client
        DealFactory(name="Zebra Deal", created_by=user)
        DealFactory(name="Alpha Deal", created_by=user)
        response = client.get(LIST_URL, {"ordering": "name"})
        names = [d["name"] for d in response.json()["results"]]
        assert names == sorted(names)

    def test_default_ordering_is_minus_created_at(self, auth_client):
        client, user = auth_client
        d1 = DealFactory(created_by=user)
        d2 = DealFactory(created_by=user)
        response = client.get(LIST_URL)
        ids = [d["id"] for d in response.json()["results"]]
        assert ids.index(d2.id) < ids.index(d1.id)

    def test_pagination_envelope(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL)
        data = response.json()
        assert "count" in data
        assert "next" in data
        assert "previous" in data
        assert "results" in data

    def test_page_size_over_100_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL, {"page_size": 200})
        assert response.status_code == 400

    def test_page_invalid_returns_404(self, auth_client):
        client, _ = auth_client
        response = client.get(LIST_URL, {"page": "abc"})
        assert response.status_code == 404

    def test_pipelines_endpoint_returns_sales_pipeline(self, auth_client, seed_pipeline):
        client, _ = auth_client
        response = client.get(PIPELINES_URL)
        assert response.status_code == 200
        data = response.json()
        names = [p["name"] for p in data]
        assert "Sales Pipeline" in names
        pipeline = next(p for p in data if p["name"] == "Sales Pipeline")
        assert len(pipeline["stages"]) == 6


# ---------------------------------------------------------------------------
# US2 — Create endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDealCreate:
    def test_name_only_returns_201(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"name": "New Deal"}, format="json")
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Deal"
        assert data["probability"] is None
        assert data["is_won"] is False
        assert data["is_lost"] is False

    def test_with_stage_auto_sets_probability(self, auth_client):
        client, _ = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1, probability=50)
        response = client.post(
            LIST_URL,
            {"name": "Deal", "pipeline_id": pipeline.id, "stage_id": stage.id},
            format="json",
        )
        assert response.status_code == 201
        assert response.json()["probability"] == 50

    def test_user_probability_wins_over_stage(self, auth_client):
        client, _ = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1, probability=50)
        response = client.post(
            LIST_URL,
            {"name": "Deal", "pipeline_id": pipeline.id, "stage_id": stage.id, "probability": 35},
            format="json",
        )
        assert response.status_code == 201
        assert response.json()["probability"] == 35

    def test_blank_name_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"name": ""}, format="json")
        assert response.status_code == 400
        assert "name" in response.json()

    def test_negative_amount_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"name": "Deal", "amount": -100}, format="json")
        assert response.status_code == 400
        assert "amount" in response.json()

    def test_probability_over_100_returns_400(self, auth_client):
        client, _ = auth_client
        response = client.post(LIST_URL, {"name": "Deal", "probability": 150}, format="json")
        assert response.status_code == 400
        assert "probability" in response.json()

    def test_stage_from_wrong_pipeline_returns_400(self, auth_client):
        client, _ = auth_client
        pipeline_a = PipelineFactory()
        pipeline_b = PipelineFactory()
        stage_b = StageFactory(pipeline=pipeline_b, order_index=1)
        response = client.post(
            LIST_URL,
            {"name": "Deal", "pipeline_id": pipeline_a.id, "stage_id": stage_b.id},
            format="json",
        )
        assert response.status_code == 400

    def test_unauthenticated_returns_401(self, anon_client):
        response = anon_client.post(LIST_URL, {"name": "Deal"}, format="json")
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US3 — Retrieve endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDealRetrieve:
    def test_exists_returns_200_with_all_fields(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1, probability=50, is_won=False)
        deal = DealFactory(pipeline=pipeline, stage=stage, created_by=user)
        response = client.get(detail_url(deal.id))
        assert response.status_code == 200
        data = response.json()
        for field in ["id", "name", "amount", "currency", "close_date", "probability",
                      "is_won", "is_lost", "is_deleted", "created_at", "updated_at"]:
            assert field in data

    def test_is_won_true_for_closed_won_stage(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1, is_won=True, is_lost=False)
        deal = DealFactory(pipeline=pipeline, stage=stage, created_by=user)
        response = client.get(detail_url(deal.id))
        assert response.json()["is_won"] is True
        assert response.json()["is_lost"] is False

    def test_is_lost_true_for_closed_lost_stage(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage = StageFactory(pipeline=pipeline, order_index=1, is_won=False, is_lost=True)
        deal = DealFactory(pipeline=pipeline, stage=stage, created_by=user)
        response = client.get(detail_url(deal.id))
        assert response.json()["is_won"] is False
        assert response.json()["is_lost"] is True

    def test_soft_deleted_returns_404(self, auth_client):
        client, user = auth_client
        deal = DealFactory(is_deleted=True, created_by=user)
        response = client.get(detail_url(deal.id))
        assert response.status_code == 404

    def test_nonexistent_returns_404(self, auth_client):
        client, _ = auth_client
        response = client.get(detail_url(99999))
        assert response.status_code == 404

    def test_unauthenticated_returns_401(self, anon_client):
        deal = DealFactory()
        response = anon_client.get(detail_url(deal.id))
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US4 — Update endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDealUpdate:
    def test_valid_put_returns_200(self, auth_client):
        client, user = auth_client
        deal = DealFactory(name="Old Name", created_by=user)
        response = client.put(detail_url(deal.id), {"name": "New Name"}, format="json")
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"

    def test_patch_stage_only_auto_sets_probability(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage_a = StageFactory(pipeline=pipeline, order_index=1, probability=25)
        stage_b = StageFactory(pipeline=pipeline, order_index=2, probability=75)
        deal = DealFactory(pipeline=pipeline, stage=stage_a, probability=25, created_by=user)
        response = client.patch(detail_url(deal.id), {"stage_id": stage_b.id}, format="json")
        assert response.status_code == 200
        assert response.json()["probability"] == 75

    def test_patch_stage_with_probability_user_wins(self, auth_client):
        client, user = auth_client
        pipeline = PipelineFactory()
        stage_a = StageFactory(pipeline=pipeline, order_index=1, probability=25)
        stage_b = StageFactory(pipeline=pipeline, order_index=2, probability=75)
        deal = DealFactory(pipeline=pipeline, stage=stage_a, created_by=user)
        response = client.patch(
            detail_url(deal.id), {"stage_id": stage_b.id, "probability": 45}, format="json"
        )
        assert response.status_code == 200
        assert response.json()["probability"] == 45

    def test_clear_name_returns_400(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        response = client.patch(detail_url(deal.id), {"name": ""}, format="json")
        assert response.status_code == 400

    def test_negative_amount_patch_returns_400(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        response = client.patch(detail_url(deal.id), {"amount": -50}, format="json")
        assert response.status_code == 400

    def test_stage_from_wrong_pipeline_patch_returns_400(self, auth_client):
        client, user = auth_client
        pipeline_a = PipelineFactory()
        pipeline_b = PipelineFactory()
        stage_a = StageFactory(pipeline=pipeline_a, order_index=1)
        stage_b = StageFactory(pipeline=pipeline_b, order_index=1)
        deal = DealFactory(pipeline=pipeline_a, stage=stage_a, created_by=user)
        response = client.patch(detail_url(deal.id), {"stage_id": stage_b.id}, format="json")
        assert response.status_code == 400

    def test_unauthenticated_returns_401(self, anon_client):
        deal = DealFactory()
        response = anon_client.patch(detail_url(deal.id), {"name": "x"}, format="json")
        assert response.status_code == 401


# ---------------------------------------------------------------------------
# US5 — Destroy endpoint tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDealDestroy:
    def test_delete_returns_204(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        response = client.delete(detail_url(deal.id))
        assert response.status_code == 204

    def test_subsequent_get_returns_404(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        client.delete(detail_url(deal.id))
        response = client.get(detail_url(deal.id))
        assert response.status_code == 404

    def test_db_row_has_is_deleted_true(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        client.delete(detail_url(deal.id))
        deal.refresh_from_db()
        assert deal.is_deleted is True

    def test_list_excludes_soft_deleted(self, auth_client):
        client, user = auth_client
        deal = DealFactory(created_by=user)
        client.delete(detail_url(deal.id))
        response = client.get(LIST_URL)
        ids = [d["id"] for d in response.json()["results"]]
        assert deal.id not in ids

    def test_unauthenticated_delete_returns_401(self, anon_client):
        deal = DealFactory()
        response = anon_client.delete(detail_url(deal.id))
        assert response.status_code == 401

    def test_already_deleted_returns_404(self, auth_client):
        client, user = auth_client
        deal = DealFactory(is_deleted=True, created_by=user)
        response = client.delete(detail_url(deal.id))
        assert response.status_code == 404
