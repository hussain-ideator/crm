import base64
import json

from adrf.views import APIView
from asgiref.sync import sync_to_async
from django.conf import settings
from django.utils import timezone
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
    extend_schema,
    inline_serializer,
)
from rest_framework import serializers as drf_serializers
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import RefreshTokenFamily, RefreshTokenLineage
from apps.accounts.serializers import LoginSerializer

REFRESH_COOKIE_NAME = "refresh_token"
# Path "/" ensures the browser sends the cookie on every request so that
# Next.js server components (dashboard layout auth gate) can read it.
# The refresh token is only *consumed* by /api/auth/refresh, but it must
# be present in all requests for the layout cookie-check to work.
REFRESH_COOKIE_PATH = "/"
REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60  # 7 days in seconds


def _refresh_cookie_kwargs() -> dict:
    """Return Set-Cookie keyword arguments for the refresh token cookie."""
    is_prod = not settings.DEBUG
    return {
        "key": REFRESH_COOKIE_NAME,
        "httponly": True,
        "secure": is_prod,
        "samesite": "Strict" if is_prod else "Lax",
        "max_age": REFRESH_COOKIE_MAX_AGE,
        "path": REFRESH_COOKIE_PATH,
    }


def _decode_jti_unverified(raw_token: str) -> str | None:
    """Extract the JTI claim from a JWT without verifying signature or expiry.

    We decode unverified so the stale-token (is_active=False) branch in
    RefreshView is reachable even after the token has been blacklisted by
    simplejwt, enabling family revocation (FR-006, T034).
    """
    try:
        parts = raw_token.split(".")
        if len(parts) != 3:
            return None
        segment = parts[1]
        remainder = len(segment) % 4
        if remainder:
            segment += "=" * (4 - remainder)
        payload = json.loads(base64.urlsafe_b64decode(segment))
        jti = payload.get("jti")
        return str(jti) if jti else None
    except Exception:
        return None


def _issue_tokens(user):
    """Issue simplejwt access + refresh tokens (sync — wraps ORM calls)."""
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    return refresh, access


_ACCESS_RESPONSE = inline_serializer(
    name="AccessTokenResponse",
    fields={"access": drf_serializers.CharField()},
)
_ERROR_RESPONSE = inline_serializer(
    name="ErrorResponse",
    fields={"detail": drf_serializers.CharField()},
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="auth_login",
        tags=["auth"],
        request=inline_serializer(
            name="LoginRequest",
            fields={
                "email": drf_serializers.EmailField(),
                "password": drf_serializers.CharField(),
            },
        ),
        responses={
            200: _ACCESS_RESPONSE,
            401: OpenApiResponse(response=_ERROR_RESPONSE, description="Invalid credentials"),
        },
    )
    async def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})

        # Serializer validation hits the DB (authenticate()) — must run in sync thread.
        await sync_to_async(serializer.is_valid)(raise_exception=True)
        user = serializer.validated_data["user"]

        # simplejwt token generation touches OutstandingToken table synchronously.
        refresh, access = await sync_to_async(_issue_tokens)(user)

        jti = str(refresh["jti"])
        expires_at = timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]

        family = await RefreshTokenFamily.objects.acreate(user=user)
        await RefreshTokenLineage.objects.acreate(
            jti=jti,
            family=family,
            expires_at=expires_at,
        )

        response = Response({"access": str(access)}, status=status.HTTP_200_OK)
        response.set_cookie(value=str(refresh), **_refresh_cookie_kwargs())
        return response


class RefreshView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="auth_refresh",
        tags=["auth"],
        parameters=[
            OpenApiParameter(
                name="refresh_token",
                location=OpenApiParameter.COOKIE,
                required=True,
                description="HttpOnly refresh token set by auth_login.",
            )
        ],
        request=None,
        responses={
            200: _ACCESS_RESPONSE,
            401: OpenApiResponse(response=_ERROR_RESPONSE, description="Invalid or stale token"),
        },
    )
    async def post(self, request):
        raw_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if not raw_token:
            return Response(
                {"detail": "Refresh token missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        jti = _decode_jti_unverified(raw_token)
        if not jti:
            return Response(
                {"detail": "Invalid token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            lineage = await RefreshTokenLineage.objects.select_related("family__user").aget(jti=jti)
        except RefreshTokenLineage.DoesNotExist:
            return Response(
                {"detail": "Token not recognized."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not lineage.is_active:
            # Stale token reuse detected — revoke the entire family (FR-006, FR-007).
            await sync_to_async(lineage.family.revoke_family)()
            return Response(
                {"detail": "Token has been rotated or revoked."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Full JWT validation: signature, expiry, blacklist.
        try:
            old_refresh = await sync_to_async(RefreshToken)(raw_token)
        except (TokenError, Exception):
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        now = timezone.now()
        lineage.is_active = False
        lineage.revoked_at = now
        await sync_to_async(lineage.save)(update_fields=["is_active", "revoked_at"])

        await sync_to_async(old_refresh.blacklist)()

        user = lineage.family.user
        new_refresh, new_access = await sync_to_async(_issue_tokens)(user)

        new_jti = str(new_refresh["jti"])
        expires_at = now + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
        await RefreshTokenLineage.objects.acreate(
            jti=new_jti,
            family=lineage.family,
            expires_at=expires_at,
        )

        response = Response({"access": str(new_access)}, status=status.HTTP_200_OK)
        response.set_cookie(value=str(new_refresh), **_refresh_cookie_kwargs())
        return response


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="auth_logout",
        tags=["auth"],
        request=None,
        responses={
            204: OpenApiResponse(description="Logout successful; cookie cleared"),
            401: OpenApiResponse(response=_ERROR_RESPONSE, description="Not authenticated"),
        },
    )
    async def post(self, request):
        raw_token = request.COOKIES.get(REFRESH_COOKIE_NAME)
        if raw_token:
            jti = _decode_jti_unverified(raw_token)
            if jti:
                try:
                    lineage = await RefreshTokenLineage.objects.select_related("family").aget(
                        jti=jti
                    )
                    if lineage.is_active:
                        now = timezone.now()
                        lineage.is_active = False
                        lineage.revoked_at = now
                        await sync_to_async(lineage.save)(update_fields=["is_active", "revoked_at"])
                        family = lineage.family
                        family.is_revoked = True
                        await sync_to_async(family.save)(update_fields=["is_revoked"])
                        try:
                            old_refresh = await sync_to_async(RefreshToken)(raw_token)
                            await sync_to_async(old_refresh.blacklist)()
                        except (TokenError, Exception):
                            pass
                except RefreshTokenLineage.DoesNotExist:
                    pass

        is_prod = not settings.DEBUG
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie(
            REFRESH_COOKIE_NAME,
            path=REFRESH_COOKIE_PATH,
            samesite="Strict" if is_prod else "Lax",
        )
        return response
