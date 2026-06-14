---

description: "Task list for the Leads module implementation"
---

# Tasks: Leads Module

**Input**: Design documents from `agent-os/specs/leads/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Exact file paths are included in every description

## Path Conventions

- Backend: `backend/apps/leads/` · `backend/crm/urls.py`
- Frontend: `frontend/src/features/leads/` · `frontend/src/app/(dashboard)/leads/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bootstrap the leads app so migrations can run and the router is wired up. No user story can begin until this is done.

- [ ] T001 Create leads app skeleton — `backend/apps/leads/__init__.py`, `apps.py`, `admin.py` — and add `'apps.leads'` to `INSTALLED_APPS` in `backend/crm/settings.py`
- [ ] T002 Create `backend/apps/leads/tests/__init__.py` to make the tests directory a package

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data model, migrations, seeding, and URL wiring that every user story depends on. No story phase can begin until this is complete.

**⚠️ CRITICAL**: Must be complete before Phase 3+

- [ ] T003 Define `Salutation` and `LeadStatus` `TextChoices` classes, `LeadSource` model, and `Lead` model (all ADR-005 fields, `SoftDeleteMixin`, `TimestampedModel`, `converted_deal_fk = ForeignKey('deals.Deal', null=True, blank=True, on_delete=SET_NULL)`) in `backend/apps/leads/models.py`
- [ ] T004 Generate `0001_initial.py` migration creating `leads_leadsource` and `leads_lead` tables in `backend/apps/leads/migrations/0001_initial.py`
- [ ] T005 Write `0002_seed_lead_sources.py` data migration seeding Web, Referral, Cold Call, Email, Social Media via `RunPython(seed_lead_sources, unseed_lead_sources)` with `get_or_create` in `backend/apps/leads/migrations/0002_seed_lead_sources.py`
- [ ] T006 Run `python manage.py migrate` and verify both migrations apply cleanly and `LeadSource` table contains 5 rows
- [ ] T007 Register leads router in `backend/crm/urls.py` — `path("api/", include("apps.leads.urls"))`
- [ ] T008 [P] Create `LeadSourceFactory` and `LeadFactory` (with all optional fields defaulting to blank/null, `status` defaulting to `"new"`) in `backend/apps/leads/tests/factories.py`
- [ ] T009 [P] Define `Lead`, `LeadSource`, `LeadDetail`, and `LeadListItem` TypeScript interfaces in `frontend/src/features/leads/types.ts`
- [ ] T010 [P] Define Zod schema `leadSchema` (first_name + last_name required, status enum excluding `'converted'`, no_of_employees min 0) and `createLeadSchema` / `updateLeadSchema` in `frontend/src/features/leads/schemas/lead.ts`

**Checkpoint**: Migrations pass, URL registered, factory and TS types ready — story phases can begin

---

## Phase 3: User Story 1 — Browse the Lead List (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a paginated, searchable, filterable, sortable table of all active leads; URL reflects all query state.

**Independent Test**: Navigate to `/leads` as an authenticated user — confirm rows render, enter a search term, apply a status filter, click a column header to sort, navigate to page 2. Confirm the URL updates at each step and copying the URL into a new tab reproduces the same view.

### Implementation for User Story 1

- [ ] T011 Implement `LeadFilter` FilterSet (status, source_fk_id, owner_fk_id exact filters) and Q-based search across `first_name`, `last_name`, `email`, `company_name`, `phone` applied when `?q=` is non-empty in `backend/apps/leads/filters.py`
- [ ] T012 [P] Co-locate `LeadPageNumberPagination` subclass (`page` / `page_size`, 1-based, max 100, returns `count` / `next` / `previous`) in `backend/apps/leads/pagination.py`
- [ ] T013 Implement `LeadSourceSerializer` (id, name) and `LeadSerializer` with dual FK fields (`source_id` writable / `source` read-only nested; `owner_id` writable / `owner` read-only nested), `validate_status` blocking `"converted"`, `validate_no_of_employees` rejecting negatives, and `converted_deal_fk` as read-only nested `{id, name}` in `backend/apps/leads/serializers.py`
- [ ] T014 Implement `LeadViewSet` with `queryset = Lead.objects.filter(is_deleted=False)`, `filter_backends` (DjangoFilterBackend, SearchFilter, OrderingFilter), `filterset_class = LeadFilter`, `ordering = ["-created_at"]`, `ordering_fields` explicit list, and `IsAuthenticated` permission in `backend/apps/leads/views.py`
- [ ] T015 Register `LeadViewSet` and read-only `LeadSourceViewSet` with DRF router in `backend/apps/leads/urls.py`
- [ ] T016 Write list endpoint tests (unauthenticated → 401, returns only non-deleted leads, `?q=` matches correct fields, `?status=` filter, `?source=` filter, `?owner=` filter, combined filters, `?ordering=` column, default order is `-created_at`, pagination `count`/`next`/`previous`, `page_size` > 100 → 400, non-integer `page` → 400) in `backend/apps/leads/tests/test_views.py`
- [ ] T017 [P] Implement `fetchLeads(params)` and `fetchLeadSources()` API functions in `frontend/src/features/leads/api.ts`
- [ ] T018 [P] Implement `useLeadsSearchParams` hook (reads/writes `q`, `status`, `source`, `owner`, `ordering`, `page`, `page_size` via `useSearchParams` + `router.replace`) and `useLeads(params)` TanStack Query hook in `frontend/src/features/leads/hooks/useLeads.ts`
- [ ] T019 [P] Build `LeadFilters` component — search input, status picker, source picker, owner picker — all wired to `useLeadsSearchParams` in `frontend/src/features/leads/components/LeadFilters.tsx`
- [ ] T020 Build `LeadTable` component (TanStack Table, sortable column headers via `useLeadsSearchParams`, status badge, row click → `/leads/[id]`) in `frontend/src/features/leads/components/LeadTable.tsx`
- [ ] T021 Build leads list page composing `LeadFilters`, `LeadTable`, and pagination controls; all state from `useLeadsSearchParams` in `frontend/src/app/(dashboard)/leads/page.tsx`

**Checkpoint**: US1 fully functional — authenticated user can search, filter, sort, and paginate the lead list; URL is bookmarkable

---

## Phase 4: User Story 2 — Create a Lead (Priority: P1)

**Goal**: User clicks "New Lead," fills first name + last name (required), optionally fills other fields, submits — new lead appears in list with status `new`.

**Independent Test**: Click "New Lead," submit with only first name and last name — confirm redirect to detail view and record appears in list. Submit with first name blank — confirm inline error, no record created.

### Implementation for User Story 2

- [ ] T022 Add `create` action to `LeadViewSet` (status defaults to `LeadStatus.NEW`, `created_by` set from `request.user`) in `backend/apps/leads/views.py`
- [ ] T023 Write create endpoint tests (valid minimal payload → 201 + status=new, blank first_name → 400, blank last_name → 400, with source → source linked, status=converted via POST → 400, unauthenticated → 401) in `backend/apps/leads/tests/test_views.py`
- [ ] T024 [P] Write serializer tests (validate_status rejects "converted", validate_no_of_employees rejects -1, first_name required, last_name required) in `backend/apps/leads/tests/test_serializers.py`
- [ ] T025 [P] Implement `useCreateLead` mutation hook (POST to `/api/leads/`, invalidates leads list on success) in `frontend/src/features/leads/hooks/useCreateLead.ts`
- [ ] T026 Build `LeadForm` component — React Hook Form bound to `leadSchema` Zod, salutation picker (Mr./Ms./Mrs./Dr./Mx./None), source picker (from LeadSource API), owner picker, all optional fields present, inline validation errors on required fields in `frontend/src/features/leads/components/LeadForm.tsx`
- [ ] T027 Build create lead page (renders `LeadForm` with `useCreateLead`, redirects to `/leads/[id]` on success) in `frontend/src/app/(dashboard)/leads/new/page.tsx`

**Checkpoint**: US2 fully functional — lead creation works end-to-end with correct validation

---

## Phase 5: User Story 3 — View Lead Details (Priority: P1)

**Goal**: User clicks a lead row and sees a detail page with all ADR-005 fields, a "Convert to Deal" button (if non-converted), and read-only display for converted leads.

**Independent Test**: Click any lead row — confirm all fields render. Confirm "Convert to Deal" button is visible for non-converted leads. Navigate to a soft-deleted lead URL — confirm 404.

### Implementation for User Story 3

- [ ] T028 Add `retrieve` action to `LeadViewSet` (get_object uses `is_deleted=False` queryset) in `backend/apps/leads/views.py`
- [ ] T029 Write retrieve endpoint tests (exists → 200 with all fields, soft-deleted → 404, non-existent → 404, unauthenticated → 401) in `backend/apps/leads/tests/test_views.py`
- [ ] T030 [P] Implement `useLead(id)` TanStack Query hook in `frontend/src/features/leads/hooks/useLead.ts`
- [ ] T031 Build lead detail page — display all ADR-005 fields (salutation, first/last name, title, email, phone, mobile, company_name, website, industry, no_of_employees, source, status badge, owner, created_at, updated_at); show "Convert to Deal" button when `status !== 'converted'`; show read-only mode with deal link when `status === 'converted'`; show Edit and Delete buttons in `frontend/src/app/(dashboard)/leads/[id]/page.tsx`

**Checkpoint**: US3 fully functional — detail page renders all fields; converted vs. non-converted states display correctly

---

## Phase 6: User Story 4 — Edit a Lead (Priority: P2)

**Goal**: User opens a non-converted lead, edits fields, saves — detail view reflects changes. Converted leads block editing at API and UI layers.

**Independent Test**: Open a lead, click "Edit," change status to "contacted," save — confirm detail view shows new status and `updated_at` has advanced. Attempt to edit a converted lead's URL — confirm edit controls are absent or disabled.

### Implementation for User Story 4

- [ ] T032 Add `update` and `partial_update` to `LeadViewSet` — both override to check `lead.status == CONVERTED` → raise `PermissionDenied` before calling super; `updated_by` set from `request.user` in `backend/apps/leads/views.py`
- [ ] T033 Write update/partial_update tests (valid PUT/PATCH → 200 with updated fields, converted lead PUT/PATCH → 403, status=converted via PATCH → 400, clear first_name → 400, unauthenticated → 401) in `backend/apps/leads/tests/test_views.py`
- [ ] T034 [P] Implement `useUpdateLead` mutation hook (PATCH to `/api/leads/[id]/`, invalidates lead + list on success) in `frontend/src/features/leads/hooks/useUpdateLead.ts`
- [ ] T035 Build lead edit page (renders `LeadForm` pre-filled with current values via `useLead`, uses `useUpdateLead`, redirects to `/leads/[id]` on success; redirects away or renders read-only message when `status === 'converted'`) in `frontend/src/app/(dashboard)/leads/[id]/edit/page.tsx`

**Checkpoint**: US4 fully functional — edits persist correctly; converted leads are read-only at both layers

---

## Phase 7: User Story 5 — Convert a Lead to a Deal (Priority: P2)

**Goal**: User clicks "Convert to Deal" on a qualified lead — system atomically creates Deal, Contact, and optionally Company; lead becomes read-only with a link to the new Deal.

**Independent Test**: Open a lead with `company_name` set, click "Convert to Deal," confirm the lead is read-only with a deal link. Open a lead with blank `company_name`, convert — confirm no Company was created, Contact and Deal exist. Attempt to convert an already-converted lead — confirm descriptive error, no duplicate records.

### Implementation for User Story 5

- [ ] T036 Implement `convert_lead_to_deal(lead, requesting_user)` service in `backend/apps/leads/services.py` — single `transaction.atomic()` block; Branch A (company_name present → create Company + Contact + Deal), Branch B (company_name blank → Contact + Deal only); local imports of Company, Contact, and `django_apps.get_model('deals','Deal')`; update lead status/converted_at/converted_deal_fk; raise `ValueError` if already converted
- [ ] T037 Write `test_services.py` covering all four cases: `test_convert_with_company_name` (Branch A — Company + Contact + Deal created, lead marked converted), `test_convert_without_company_name` (Branch B — no Company row, Contact + Deal created, contact.company_fk=None), `test_convert_rolls_back_on_failure` (patch Contact.objects.create to raise IntegrityError → assert 0 Company rows, 0 Deal rows, lead status unchanged), `test_convert_already_converted_raises` (ValueError with "already converted") in `backend/apps/leads/tests/test_services.py`
- [ ] T038 Add `convert` `@action(detail=True, methods=['post'], url_path='convert')` to `LeadViewSet` — calls `convert_lead_to_deal`, catches `ValueError` → 400, returns updated lead serializer on success in `backend/apps/leads/views.py`
- [ ] T039 Write convert endpoint tests (non-converted lead → 200 + lead.status=converted + deal link in response, already-converted → 400, soft-deleted → 404, unauthenticated → 401) in `backend/apps/leads/tests/test_views.py`
- [ ] T040 [P] Implement `useConvertLead(id)` mutation hook (POST to `/api/leads/[id]/convert/`, invalidates lead + list on success) in `frontend/src/features/leads/hooks/useConvertLead.ts`
- [ ] T041 [P] Build `ConvertLeadButton` component (confirm dialog, calls `useConvertLead`, visible only when `status !== 'converted'`, shows disabled/completed state post-conversion) in `frontend/src/features/leads/components/ConvertLeadButton.tsx`
- [ ] T042 Wire `ConvertLeadButton` into lead detail page and navigate to `/deals/[converted_deal_fk.id]` link after successful conversion in `frontend/src/app/(dashboard)/leads/[id]/page.tsx`

**Checkpoint**: US5 fully functional — conversion atomically creates all records; both FR-021a branches work; lead is immediately read-only post-conversion

---

## Phase 8: User Story 6 — Soft Delete a Lead (Priority: P2)

**Goal**: User deletes a non-converted lead — it disappears from all views but the row is preserved with `is_deleted=True`. Converted leads block deletion.

**Independent Test**: Delete a non-converted lead — confirm it disappears from the list, navigating to its URL returns 404, and the DB row has `is_deleted=True`. Attempt to delete a converted lead — confirm 403 error.

### Implementation for User Story 6

- [ ] T043 Override `destroy()` on `LeadViewSet` — check `lead.status == CONVERTED` → raise `PermissionDenied`; else set `is_deleted=True` and `save(update_fields=['is_deleted','updated_at'])` → return 204 in `backend/apps/leads/views.py`
- [ ] T044 Write destroy tests (non-converted DELETE → 204 + is_deleted=True in DB + subsequent GET → 404, converted DELETE → 403, soft-deleted DELETE → 404, unauthenticated → 401) in `backend/apps/leads/tests/test_views.py`
- [ ] T045 [P] Implement `useDeleteLead(id)` mutation hook (DELETE to `/api/leads/[id]/`, invalidates list + removes lead query on success) in `frontend/src/features/leads/hooks/useDeleteLead.ts`
- [ ] T046 [P] Build `DeleteLeadButton` component (confirm dialog, calls `useDeleteLead`, hidden when `status === 'converted'`, redirects to `/leads` on success) in `frontend/src/features/leads/components/DeleteLeadButton.tsx`
- [ ] T047 Wire `DeleteLeadButton` into lead detail page in `frontend/src/app/(dashboard)/leads/[id]/page.tsx`

**Checkpoint**: US6 fully functional — soft delete works end-to-end; converted leads are protected from deletion

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, admin registration, OpenAPI schema, and model-level tests that benefit all stories.

- [ ] T048 [P] Write model tests (LeadStatus choices contain exactly 5 values, Salutation choices contain exactly 6, default status is "new", is_deleted defaults to False, no_of_employees PositiveIntegerField rejects negatives at DB level) in `backend/apps/leads/tests/test_models.py`
- [ ] T049 [P] Register `Lead` and `LeadSource` in `backend/apps/leads/admin.py` with list_display and search_fields
- [ ] T050 [P] Add drf-spectacular `@extend_schema` annotations to `LeadViewSet` and `LeadSourceViewSet` (request/response schemas, 400/401/403/404 response codes, convert action documented) in `backend/apps/leads/views.py`
- [ ] T051 [P] Write edge-case tests (no_of_employees=-1 → 400, page=abc → 400, page_size=200 → 400, q with special chars returns safe substring match, empty q returns all leads) in `backend/apps/leads/tests/test_views.py`
- [ ] T052 [P] Add `leads` nav link to the sidebar component in `frontend/src/app/(dashboard)/` layout so the Leads section is accessible from all dashboard pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **blocks all user story phases**
- **US1, US2, US3 (Phases 3–5)**: All depend on Phase 2; US1, US2, US3 are all P1 and can proceed in priority order (or in parallel if staffed)
- **US4, US5, US6 (Phases 6–8)**: Depend on Phase 2; US4 requires US3 detail page; US5 requires US3 detail page; US6 requires US3 detail page — but backend tasks within US4–US6 can start as soon as Phase 2 is done
- **Polish (Phase 9)**: Can start once Phases 2–8 are complete; individual tasks are all parallel

### User Story Dependencies

| Story | Depends on | Notes |
|---|---|---|
| US1 (Browse List) | Phase 2 | Fully independent |
| US2 (Create) | Phase 2 | Fully independent; list page (US1) needed for UX flow only |
| US3 (View Detail) | Phase 2 | Fully independent; list page (US1) needed to navigate to detail |
| US4 (Edit) | US3 | Edit page reuses `LeadForm` and detail redirect |
| US5 (Convert) | US3 | Convert button lives on detail page |
| US6 (Soft Delete) | US3 | Delete button lives on detail page |

### Within Each User Story

- Backend: models → serializers → filters → viewset action → tests
- Frontend: API client → hooks → components → page
- Backend and frontend tasks marked [P] within a story can run in parallel once their story's foundational tasks (T003–T007) are done

---

## Parallel Opportunities

### Phase 2 (after T003–T007 complete sequentially)
```
T008 (factories)  ──┐
T009 (TS types)   ──┤ all in parallel
T010 (Zod schema) ──┘
```

### Phase 3 (US1 — after T011–T015 complete)
```
T016 (backend tests) ──┐
T017 (api.ts)        ──┤
T018 (hooks)         ──┤ all in parallel
T019 (LeadFilters)   ──┤
T020 (LeadTable)     ──┘
```

### Phase 7 (US5 — after T036–T039 complete)
```
T040 (useConvertLead hook) ──┐ in parallel
T041 (ConvertLeadButton)   ──┘
```

### Phase 8 (US6 — after T043–T044 complete)
```
T045 (useDeleteLead hook)  ──┐ in parallel
T046 (DeleteLeadButton)    ──┘
```

### Phase 9 (all independent)
```
T048  T049  T050  T051  T052  ← all in parallel
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — all P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (migrations, seeding, URL wiring, factories, types)
3. Complete Phase 3: US1 — list view with search/filter/sort
4. Complete Phase 4: US2 — create form
5. Complete Phase 5: US3 — detail view
6. **STOP and VALIDATE**: All P1 stories independently functional
7. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → test independently → deploy (users can browse leads)
3. US2 → test independently → deploy (users can create leads)
4. US3 → test independently → deploy (users can view details)
5. US4 → test independently → deploy (users can edit)
6. US5 → test independently → deploy (users can convert)
7. US6 → test independently → deploy (users can delete)
8. Polish → final QA

---

## Notes

- `[P]` tasks target different files with no blocking dependencies — safe to run simultaneously
- `[US#]` label maps each task to its user story for traceability and MVP scoping
- `convert_lead_to_deal()` uses **local imports** inside the function body — do not move them to module level (FR-031)
- `converted_deal_fk` FK migration (`0003`) may need to be deferred until the `deals` app is installed — see plan.md
- Soft-delete queryset filter (`is_deleted=False`) is set at the ViewSet level; never bypass it with `Lead.objects.all()`
- Status `'converted'` must never appear in the Zod schema status enum on the frontend form
