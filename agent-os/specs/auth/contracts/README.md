# Auth API Contracts

**Feature**: JWT Authentication | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

## Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/login/` | None | Authenticate; receive access token + set refresh cookie |
| `POST` | `/api/auth/refresh/` | Cookie | Rotate refresh token; receive new access token |
| `POST` | `/api/auth/logout/` | Bearer | Revoke refresh token; clear cookie |

## Token Transport

| Token | Transport | Stored by |
|-------|-----------|-----------|
| Access token (15 min TTL) | Response body → client memory | Client (`src/lib/auth.ts` module variable) |
| Refresh token (7 day TTL) | `Set-Cookie: refresh_token` (HttpOnly) | Browser cookie jar (inaccessible to JS) |

## Contract Source of Truth

`openapi.yml` in this directory is the authoritative contract for request/response shapes.

The full OpenAPI 3.0 schema is generated at runtime by drf-spectacular (`GET /api/schema/`) — this file is a human-readable excerpt covering only the auth endpoints. Do not edit `openapi.yml` manually after the backend is implemented; regenerate it from drf-spectacular instead.

## Frontend Integration Notes

- **Login flow**: `POST /api/auth/login/` → store `response.access` in module variable → browser receives `Set-Cookie` automatically
- **Refresh flow**: `POST /api/auth/refresh/` → browser sends `refresh_token` cookie automatically → store new `response.access`; do NOT manually send the cookie value in the request body
- **Logout flow**: `POST /api/auth/logout/` with `Authorization: Bearer <access>` → backend revokes cookie and clears it via `Set-Cookie: refresh_token=; Max-Age=0`
- **Auth header**: `Authorization: Bearer <access_token>` on all authenticated requests
- **Concurrent refresh**: see [../research.md RES-005](../research.md) — use singleton Promise to deduplicate
