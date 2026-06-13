# Deals — Kanban / stage view (landing) — notes

> Source screenshot: `sales-deals-landing-page.png`
> Module: Deals · Screen type: list (Kanban / "STAGEVIEW")
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> Note: despite the "landing-page" filename, this screenshot shows the **Kanban
> stage view** (URL `/kanban`), not a flat table. The flat list appears in
> `sales-deals-create-dropdown.png`.

## 1. Purpose

See deals grouped by pipeline stage as a Kanban board, gauge per-stage totals,
and move deals between stages. Primary actor: a sales user / manager `[VERIFY]`.

## 2. Layout regions

- Left global nav (Deals selected).
- Sub-toolbar: **All Deals** selector, Filter, Sort, view toggles (Kanban
  active), refresh; **Create Deal** + overflow.
- Left filter panel ("Filter Deals by" + System Defined Filters).
- Main: horizontally-scrolling **stage columns** ("STAGEVIEW"), each with deal
  cards and a per-column header.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Toolbar (All Deals, Filter, Sort, view toggles, refresh) + Create Deal.
3. Filter panel.
4. Stage columns (Kanban), each: stage name, deal count, probability %, summed
   amount, then deal cards + a "Create Deal" affordance per column.

## 4. Default data shown

Stage columns visible (header = stage name · count · probability% · sum):
- **Qualification** · (1) · 10% · Rs. 2,50,000.00 — card: *Benton*,
  Qualification, Benton (Sample), owner mohamedalihussain.hm, John Butt
  (Sample), 13/06/2026.
- **Needs Analysis** · (2) · 20% · Rs. 1,00,000.00 — cards: *Truhlar And
  Truhlar Attys* (Sage Wieser, 13/06/2026), *Chanay*.
- **Value Proposition** · Rs. 70,000.00 — card: *Chemel* (James Venere,
  13/06/2026).

Card fields map to ERD `Deal`:
- Deal name → `name`. ✓
- Stage column → `stage_fk`; the column header **probability %** → `Stage.probability`. ✓
- Account/company on card → `company_fk`. ✓
- Owner → `owner`. ✓
- Contact on card → `primary_contact_fk`. ✓
- Date (13/06/2026) → `close_date` `[VERIFY]` (could be created date).
- Amount (Rs.) → `amount` + `currency` (INR shown). ✓
- Grouping is by `Stage` within a `Pipeline` (ERD Pipeline→Stage ordered). ✓

## 5. Filters / search / sort

- Filter panel + System Defined Filters (Zoho-native; not in ERD) `[VERIFY]`.
- Kanban grouping dimension is **Stage**; whether the pipeline is selectable is
  not shown `[VERIFY]` (ERD supports multiple pipelines).
- Sort within columns not shown `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Create Deal | toolbar + per-column | `POST /api/deals/` | Column create may preset stage `[VERIFY]` |
| Primary   | (overflow "...") | beside Create Deal | — | Bulk actions `[VERIFY]` |
| Secondary | Move deal between stages | drag card `[VERIFY]` | `PATCH /api/deals/{id}/` (stage) | Core Kanban interaction |
| Secondary | Open deal | click card | `GET /api/deals/{id}/` | `[VERIFY]` |
| Secondary | Switch view (list/Kanban) | toolbar | route change | |
| Secondary | Filter / Sort / Refresh | toolbar | `[VERIFY]` | |

## 7. States

- **Default:** populated stage columns with sample deals.
- **Empty:** empty columns / no deals not shown `[VERIFY]`.
- **Loading / Error:** not shown `[VERIFY]`.
- **Filtered:** board reflects active filter `[VERIFY]`.

## 8. RBAC notes

- Board should show only deals the user may see (own + role-shared,
  `get_queryset()`) `[VERIFY]`.
- Stage-change permission may be role-gated `[VERIFY]`.

## 9. Validation behavior

- Moving to a won/lost stage may require extra fields (close reason, etc.)
  `[VERIFY]`. ERD `Stage` has `is_won`/`is_lost` and `Deal` has won/lost flags.

## 10. Performance notes

- Kanban loads many deals at once; paginate per column / lazy-load `[VERIFY]`.
- `select_related` `owner`, `company`, `primary_contact`, `stage`, `pipeline`;
  aggregate per-stage sums DB-side.
- Index `stage_fk`, `pipeline_fk`, `close_date`.

## 11. Open questions

- [ ] [VERIFY] Is the date on cards `close_date` or created date?
- [ ] [VERIFY] Is the pipeline selectable (multi-pipeline support)?
- [ ] [VERIFY] Drag-to-move stage interaction + required fields on won/lost.
- [ ] [VERIFY] Per-column pagination / lazy load.
- [ ] [VERIFY] Overflow (bulk) actions; RBAC scope and stage-change gating.
