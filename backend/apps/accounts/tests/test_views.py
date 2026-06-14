import pytest

from apps.accounts.models import RefreshTokenFamily, RefreshTokenLineage
from apps.accounts.tests.factories import UserFactory

LOGIN_URL = "/api/auth/login"
REFRESH_URL = "/api/auth/refresh"
LOGOUT_URL = "/api/auth/logout"


@pytest.mark.django_db
class TestLoginView:
    def test_login_success_returns_access_token(self, client):
        user = UserFactory(password="testpass123")
        response = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert data["access"]

    def test_login_success_sets_httponly_cookie(self, client):
        user = UserFactory(password="testpass123")
        response = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        assert response.status_code == 200
        assert "refresh_token" in response.cookies
        cookie = response.cookies["refresh_token"]
        assert cookie["httponly"]
        assert cookie["path"] == "/"

    def test_login_creates_family_and_lineage(self, client):
        user = UserFactory(password="testpass123")
        client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        assert RefreshTokenFamily.objects.filter(user=user).count() == 1
        family = RefreshTokenFamily.objects.get(user=user)
        assert family.is_revoked is False
        assert RefreshTokenLineage.objects.filter(family=family, is_active=True).count() == 1

    def test_login_wrong_password_returns_401(self, client):
        user = UserFactory(password="testpass123")
        response = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "wrongpass"},
            content_type="application/json",
        )
        assert response.status_code == 401

    def test_login_unknown_email_returns_401(self, client):
        response = client.post(
            LOGIN_URL,
            data={"email": "nobody@example.com", "password": "testpass123"},
            content_type="application/json",
        )
        assert response.status_code == 401

    def test_no_account_enumeration(self, client):
        """Wrong-password and unknown-email return identical error bodies (FR-004)."""
        user = UserFactory(password="testpass123")

        wrong_pass = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "wrongpass"},
            content_type="application/json",
        )
        unknown_email = client.post(
            LOGIN_URL,
            data={"email": "nobody@example.com", "password": "testpass123"},
            content_type="application/json",
        )
        assert wrong_pass.status_code == unknown_email.status_code == 401
        assert wrong_pass.json()["detail"] == unknown_email.json()["detail"]


@pytest.mark.django_db
class TestRefreshView:
    def _login(self, client):
        user = UserFactory(password="testpass123")
        client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        return user

    def test_refresh_success(self, client):
        self._login(client)
        response = client.post(REFRESH_URL)
        assert response.status_code == 200
        data = response.json()
        assert "access" in data
        assert data["access"]

    def test_refresh_rotates_cookie(self, client):
        self._login(client)
        old_cookie = client.cookies["refresh_token"].value

        response = client.post(REFRESH_URL)
        assert response.status_code == 200
        new_cookie = response.cookies["refresh_token"].value
        assert new_cookie != old_cookie

    def test_refresh_missing_cookie(self, client):
        response = client.post(REFRESH_URL)
        assert response.status_code == 401

    def test_refresh_invalid_token(self, client):
        client.cookies["refresh_token"] = "not.a.valid.jwt"
        response = client.post(REFRESH_URL)
        assert response.status_code == 401

    def test_refresh_creates_new_lineage_record(self, client):
        user = self._login(client)
        family = RefreshTokenFamily.objects.get(user=user)
        assert RefreshTokenLineage.objects.filter(family=family).count() == 1

        client.post(REFRESH_URL)

        assert RefreshTokenLineage.objects.filter(family=family).count() == 2
        assert RefreshTokenLineage.objects.filter(family=family, is_active=True).count() == 1


@pytest.mark.django_db
class TestLogoutView:
    def _login(self, client):
        user = UserFactory(password="testpass123")
        resp = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        return user, resp.json()["access"]

    def test_logout_revokes_token_and_clears_cookie(self, client):
        _user, access = self._login(client)
        response = client.post(
            LOGOUT_URL,
            HTTP_AUTHORIZATION=f"Bearer {access}",
        )
        assert response.status_code == 204
        # Cookie should be cleared (max-age=0 or expires in the past)
        cookie = response.cookies.get("refresh_token")
        assert cookie is not None
        assert cookie["max-age"] == 0 or int(cookie.get("max-age", 1)) <= 0

    def test_revoked_token_rejected_on_refresh(self, client):
        _user, access = self._login(client)
        # Capture the refresh cookie before logout
        raw_refresh = client.cookies["refresh_token"].value

        # Logout (revokes server-side)
        client.post(LOGOUT_URL, HTTP_AUTHORIZATION=f"Bearer {access}")

        # Restore the old cookie and attempt refresh — must be rejected
        client.cookies["refresh_token"] = raw_refresh
        response = client.post(REFRESH_URL)
        assert response.status_code == 401

    def test_logout_requires_auth(self, client):
        response = client.post(LOGOUT_URL)
        assert response.status_code == 401

    def test_logout_marks_family_revoked(self, client):
        user, access = self._login(client)
        client.post(LOGOUT_URL, HTTP_AUTHORIZATION=f"Bearer {access}")

        family = RefreshTokenFamily.objects.get(user=user)
        assert family.is_revoked is True
        assert RefreshTokenLineage.objects.filter(family=family, is_active=True).count() == 0


@pytest.mark.django_db
class TestReuseDetection:
    def _login(self, client):
        user = UserFactory(password="testpass123")
        resp = client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        return user, resp.json()["access"]

    def test_stale_token_triggers_family_revocation(self, client):
        """Presenting token A after it has been rotated revokes the whole family."""
        user, _ = self._login(client)
        token_a = client.cookies["refresh_token"].value

        # Rotate: A → B (A is now stale)
        client.post(REFRESH_URL)

        # Present stale A
        client.cookies["refresh_token"] = token_a
        response = client.post(REFRESH_URL)
        assert response.status_code == 401

        family = RefreshTokenFamily.objects.get(user=user)
        assert family.is_revoked is True

    def test_active_sibling_also_revoked_after_stale_reuse(self, client):
        """After stale A is presented, the active token B is also invalidated."""
        _user, _ = self._login(client)
        token_a = client.cookies["refresh_token"].value

        # Rotate: A → B
        client.post(REFRESH_URL)
        token_b = client.cookies["refresh_token"].value

        # Present stale A — triggers family revocation
        client.cookies["refresh_token"] = token_a
        client.post(REFRESH_URL)

        # Now try B — must also be rejected (family revoked)
        client.cookies["refresh_token"] = token_b
        response = client.post(REFRESH_URL)
        assert response.status_code == 401

    def test_fresh_login_creates_new_independent_family(self, client):
        """After revocation, logging in again creates a brand-new family."""
        user, access = self._login(client)
        old_family = RefreshTokenFamily.objects.get(user=user)

        client.post(LOGOUT_URL, HTTP_AUTHORIZATION=f"Bearer {access}")

        client.post(
            LOGIN_URL,
            data={"email": user.email, "password": "testpass123"},
            content_type="application/json",
        )
        new_families = RefreshTokenFamily.objects.filter(user=user).exclude(id=old_family.id)
        assert new_families.count() == 1
        assert new_families.first().is_revoked is False
