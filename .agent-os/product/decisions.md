# Architecture Decisions

One short entry per non-obvious decision. Newest at the top.

Format: `ADR-NNN — Title — Date — Status (Proposed | Accepted | Superseded by ADR-XXX)`

---

## ADR-004 — Monorepo for backend + frontend — 2026-06-12 — Accepted

**Context.** Solo developer building backend (Django) and frontend (Next.js).

**Decision.** Single repository with `backend/` and `frontend/` siblings.

**Consequences.** Atomic PRs across stack, single CI config, simpler local
setup. Cost: slightly larger checkouts; some CI duplication. Acceptable for
project size.

---

## ADR-003 — JWT (simplejwt) over session auth — 2026-06-12 — Accepted

**Context.** Need to authenticate Next.js client against Django API. Cookie
sessions complicate CSRF handling across origins; we want stateless API.

**Decision.** `djangorestframework-simplejwt` with access (short-lived) and
refresh (longer-lived) tokens. Refresh stored in httpOnly cookie; access in
memory on the client.

**Consequences.** Stateless API, easier scaling, easier mobile/3rd-party
later. Cost: must implement refresh rotation and revocation list.

---

## ADR-002 — adrf over plain DRF — 2026-06-12 — Accepted

**Context.** CRM has potentially long-running endpoints (bulk import, email
sync). Async views allow these without blocking workers.

**Decision.** Use `adrf` for all API views. Sync views are still acceptable
where async offers no benefit, but new endpoints default to async.

**Consequences.** Slightly less mature ecosystem than DRF. Mitigated by
adrf's compatibility with DRF serializers and filters.

---

## ADR-001 — Next.js 15 (App Router) over plain React — 2026-06-12 — Accepted

**Context.** CRM is heavy on dashboards (good SSR fit), needs route-level
auth middleware, and may eventually have public marketing pages.

**Decision.** Next.js 15 with App Router and React Server Components where
they fit (list views with server-side filters). Client components for
interactive forms.

**Consequences.** Steeper learning curve than plain React + Vite. Worth it
for SSR, middleware, and unified deploy story.
