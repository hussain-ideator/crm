# Wireframe → spec gaps

Consolidated list of gaps found while writing the Sales wireframe notes
(Leads, Contacts, Accounts, Deals, Documents, Campaigns). Each gap is a place
where a screenshot implies behavior or data that **is not yet in
`docs/erd.md` or `docs/api-contract.md`**, or where the wireframe is internally
inconsistent with our model.

> This file is a **decision aid only**. No changes have been made to the ERD or
> API contract. Phase recommendations are suggestions — you decide what to
> address now vs. defer.

**Type legend:** `ERD` = data-model gap · `API` = API-contract gap ·
`Wireframe` = inconsistency / ambiguity in the screenshots vs. our model.

**Phase legend (recommendation):** `P0` = MVP / foundational ·
`P1` = fast-follow · `P2` = later phase · `P3` = future / advanced ·
`P2+` = later phase / out of current scope (use a specific phase where known).

---

## A. Data-model field gaps (entities exist, fields don't)

> **Status:** ✅ **Resolved by [ADR-005](../../.agent-os/product/decisions.md)** (Lead
> model field set), 2026-06-14. Gaps retained below for traceability — see the
> **Resolved** column for the per-row disposition.

| Gap | Affected modules | Type | Phase | Resolved | Notes |
|-----|------------------|------|-------|----------|-------|
| `Lead` shows fields absent from ERD: Mobile, Title, Fax, Website, Industry, No. of Employees, Salutation | Leads | ERD | P0 | ✅ **ADR-005** | These are on the **create form** and detail; decide per field whether to add to `Lead`, move to a related entity, or drop. Website/Industry/Employees already exist on `Company` — confirm they shouldn't live on Lead. → ADR-005: Mobile, Title, Website, Industry, No. of Employees, Salutation kept on `Lead` (raw pre-account text); **Fax dropped** (reversible nullable column). |
| `Contact` shows fields absent from ERD: Mobile, Department | Contacts | ERD | P0 | ⚠️ **Partial — ADR-005** | ERD `Contact` has `phone` + `title` only. Mobile + Department appear on detail view. Same add/drop decision. → ADR-005 is Lead-scoped; it sets the shared `salutation` enum across Lead **and** Contact, but Contact's **Mobile/Department still need a dedicated decision**. |
| Salutation (e.g. "Ms.") shown but no field | Leads, Contacts | ERD | P0/P1 | ✅ **ADR-005** | Display-only vs. stored field. Low effort if wanted. → ADR-005: stored **enum** `Mr./Ms./Mrs./Dr./Mx./None`, shared across Lead and Contact for uniform name composites. |

## B. Enum / value mismatches

> **Status:** ✅ **Resolved** — Lead status by
> [ADR-006](../../.agent-os/product/decisions.md), Deal stage seed by
> [ADR-007](../../.agent-os/product/decisions.md), both 2026-06-14. Gaps retained
> below for traceability — see the **Resolved** column.

| Gap | Affected modules | Type | Phase | Resolved | Notes |
|-----|------------------|------|-------|----------|-------|
| Lead status values differ from ERD enum | Leads | ERD + Wireframe | **P0** | ✅ **ADR-006** | ERD enum = `new/contacted/qualified/lost/converted`. UI process strip shows **Attempted to Contact, Contact in Future, Contacted, Junk Lead, Lost Lead**. Must reconcile before building Lead status — affects filters, Kanban-like flows, conversion. → ADR-006: final enum `new/contacted/qualified/unqualified/converted` (Zoho's five-way split collapsed; ERD's `lost` → `unqualified`). |
| Deal stage list needs canonical seed | Deals | ERD | P0 | ✅ **ADR-007** | Stages seen: Qualification, Id. Decision Makers, Needs Analysis, Proposal/Price Quote, Negotiation/Review, Closed Won, Closed Lost. ERD has `Pipeline`→`Stage`; confirm the default pipeline's stage rows + probabilities + is_won/is_lost. → ADR-007: seed one `Sales Pipeline` with six stages (Qualification, Needs Analysis, Proposal, Negotiation, Closed Won, Closed Lost) + probabilities + `is_won`/`is_lost`; "Identify Decision Makers" dropped. |

## C. Display-naming conventions (low risk)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| "Lead Name" / "Contact Name" columns are composites | Leads, Contacts | Wireframe | P0 | Display composite of `first_name` + `last_name`; not a stored field. Just a serializer/display decision. |
| "Company" (Leads) vs `company_name`; "Account Name" vs `Company.name` | Leads, Accounts | Wireframe | P0 | Leads store raw `company_name` text; Accounts is the `Company` entity. Confirm labels in UI vs. field names. |

## D. Missing entities (no model, no resource)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| **Campaigns** has no ERD entity and no `/api/campaigns/` | Campaigns (+ Leads/Contacts/Accounts detail) | ERD + API | **P2** | Create form implies a full model: owner, name, type, status, start/end date, expected_revenue, budgeted_cost, actual_cost, expected_response, numbers_sent, + a "Connected To: Leads" relation. **Already referenced** as a related list on Lead/Contact/Account detail views. **Decision:** hide the Campaigns related list in Phase 0 detail views; don't stub the entity. Surface in Phase 2. |
| **Documents** has no ERD entity and no resource | Documents | ERD + API | **P2+** | WorkDrive-backed file/folder browser ("Open WorkDrive"). Closest ERD concept (`Attachment`) is a generic relation, not a file manager. Decide: native files/folders model, reuse `Attachment`, or defer to a WorkDrive integration. **Decision:** defer entirely; not in current roadmap scope. |

## E. Related lists referencing non-modeled / other-module entities

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| Detail-view related lists reference entities outside the ERD | Leads, Contacts, Accounts | ERD + Wireframe | P1/P2+ | Not in ERD: Cadences, Connected Records, Emails, Invited Meetings, Social, Products, Quotes, Sales Orders, Invoices, Cases. Several belong to **Inventory/Support** modules (separate screenshots exist) — scope per module/phase. In-ERD related lists (Notes, Attachments, Activities, Deals, Contacts) are fine. **Decision (Quotes / Sales Orders / Invoices / Cases):** out of scope. Not on the CRM roadmap. |

## F. Bulk operations (cross-cutting — one gap, all modules)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| No bulk endpoints exist | Leads, Contacts, Deals, Accounts (all list views) | API | **P2** | Overflow "..." menus expose **Mass Delete, Mass Update, Mass Convert** (Leads). Contract only has per-record CRUD + `convert`. Needs bulk endpoint design + a selection model. RBAC: gate to Manager/Admin. Explicitly Phase 2 per roadmap. |
| Deduplicate action | Leads, Contacts | API | **P2** | "Deduplicate Leads/Contacts" — no endpoint or matching rules defined. Phase 2 per roadmap. |

## G. Import / export (cross-cutting)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| Import flows have no endpoint | Leads, Contacts, Deals, Accounts | API | **P2** | Create-dropdowns expose "Import {Module}" + "Import Notes". Needs file upload, field mapping, validation, async processing. Explicitly Phase 2 per roadmap. |
| Export flows have no endpoint | Leads, Contacts (seen); likely all | API | **P2** | "Export Leads/Contacts". Define format (CSV/XLSX) + async + RBAC. Explicitly Phase 2 per roadmap. |

## H. Tags (cross-cutting)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| Tagging not modeled | Leads, Contacts, Accounts (detail "+ Add Tags"; bulk "Manage Tags") | ERD + API | **P2** | Needs a `Tag` model + m2m (likely generic, like Note/Attachment) and endpoints. Cross-cutting across all record types. Explicitly Phase 2 per roadmap. |

## I. Email actions (cross-cutting)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| "Send Email" / "Mass Email" have no endpoint or model | Leads, Contacts, Accounts (detail); bulk (Mass Email) | API + ERD | **P3** | No email-sending capability, templates, or logging in the contract. Sizable feature (provider integration, Emails related list). Email is Phase 3 per roadmap. |

## J. Analytics / Kanban interactions

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| Kanban stage move + pipeline selection | Deals | API + Wireframe | **P2** | Drag-to-move stage = `PATCH /api/deals/{id}/` (stage). Confirm: single vs. multi-pipeline selection; required fields when moving to won/lost (`is_won`/`is_lost`). Board may need per-column pagination. Kanban (Deals) is Phase 2. |
| Chart view needs an aggregation endpoint | Leads (chart view); likely all | API | **P3** | "Group By + Measure (Count)" requires server-side `GROUP BY`/`COUNT`. No aggregation endpoint exists. Index group-by columns (e.g. `created_at`). Chart aggregation is Phase 3. |

## K. Wireframe ambiguities (need confirmation, not necessarily build)

| Gap | Affected modules | Type | Phase | Notes |
|-----|------------------|------|-------|-------|
| Default sort, default-on columns, page size not visible | All list views | Wireframe | P0 | Sample data is only 10 rows; defaults can't be read from screenshots. Confirm default-on column set (a column-picker controls visibility) + default ordering. |
| System Defined Filters don't map to ERD | All list views | Wireframe | P1 | Zoho-native filters (Activities, Cadences, Latest Email Status, Locked, Touched/Untouched Records, etc.). Decide which (if any) to implement; "Filter By Fields" maps cleanly to `?<field>=`. |
| Required-field set only partially marked | Leads, Campaigns create forms | Wireframe | P0 | Visible required: Lead = Company + Last Name; Campaign = Campaign Name. Confirm the full required set + format rules (email/phone/url/currency/date). |
| RBAC scope never visible on screen | All | Wireframe | P0 | Best-practices already mandate object-level scope in `get_queryset()`. Screenshots can't confirm role gating on actions (convert, bulk, import, export) — confirm the matrix. |
| Platform-only features out of scope | Contacts (Client Script, Zoho Sheet View, Print View); Leads/Campaigns (Edit Page Layout, Client Script); Leads (Facebook/LinkedIn/TikTok Ads Sync); Leads/Contacts (Drafts) | Wireframe | P2+ | Zoho-platform/admin or external-integration features. Recommend explicitly marking out of scope. |

## Out of scope (unless customer demand)

Items intentionally parked. Revisit only if a customer explicitly asks; not on
the current roadmap.

| Item | From | Type | Notes |
|------|------|------|-------|
| **Approve Leads** | §F | API + ERD | "Approve Leads" implies an approval workflow/state not in the model. No roadmap driver; revisit on demand. |

---

## Suggested phase rollup (for quick scanning)

- **Phase 0 (MVP):** field gaps on Lead/Contact (§A), Lead status + Deal stage reconciliation (§B), display-naming decisions (§C), required-fields/validation + default sort/columns + RBAC matrix confirmation (§K). Hide the Campaigns related list (§D) rather than stubbing it.
- **Phase 1 (fast-follow):** which System Defined Filters to keep (§K); Salutation as a stored field if wanted (§A).
- **Phase 2:** Campaigns entity + related list (§D), bulk operations + dedupe (§F), import/export (§G), tags (§H), Kanban stage move + pipeline selection (§J).
- **Phase 3:** email sending / mass email (§I), chart aggregation (§J).
- **Out of scope (unless demand):** Approve workflow (§F), Documents (§D), Quotes/Sales Orders/Invoices/Cases + other Inventory/Support related lists (§E), ads sync / drafts / platform features (§K).

---

## L. Decisions log

Decisions resolved during this review (2026-06-14, per `roadmap.md`). This is the
single place to point future ADRs at; the ERD and API contract are **unchanged**.

| # | Area | Decision |
|---|------|----------|
| L1 | §D Campaigns | Hide the Campaigns related list in Phase 0 detail views; don't stub the entity. Surface in Phase 2. |
| L2 | §D Documents | Defer entirely; not in current roadmap scope. |
| L3 | §E Quotes / Sales Orders / Invoices / Cases | Out of scope. Not on the CRM roadmap. |
| L4 | §F Bulk ops + dedupe, §G Import/Export, §H Tags | Phase 2 (explicitly Phase 2 in the roadmap), not P1. |
| L5 | §F Approve Leads | Out of scope unless customer demand (see "Out of scope" section). |
| L6 | §I Email actions | Phase 3 (email is Phase 3 per roadmap), previously P2+. |
| L7 | §J Analytics / Kanban | Split: Kanban stage move (Deals) → Phase 2; chart aggregation → Phase 3. |
