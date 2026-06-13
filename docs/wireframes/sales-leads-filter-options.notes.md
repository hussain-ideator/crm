# Leads — list view (filter panel open) — notes

> Source screenshot: `sales-leads-filter-options.png`
> Module: Leads · Screen type: list
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Browse, filter, and search the Leads list, then drill into a record or create
a new one. This screenshot captures the list with the **filter panel open**.
Primary actor: a sales user viewing their leads `[VERIFY]` (visibility scope
not shown on screen).

## 2. Layout regions

- Left global nav: Zoho CRM logo, Home, Reports, Analytics, My Requests, then
  "CRM Teamspace" with a search box and an expanded **Sales** group (Leads
  [selected], Contacts, Accounts, Deals, Forecasts, Documents, Campaigns).
- Top bar: "Leads" title, a global **Search records** field, and account/
  notification icons.
- Sub-toolbar: **All Leads** view selector, **Filter**, **Sort**, a cluster of
  view-toggle icons, and a refresh icon; right-aligned **Create Lead** button
  with a dropdown caret.
- Left filter panel (open): "Filter Leads by" with a search box and a
  "System Defined Fil…" (System Defined Filters) section.
- Main content: leads table.
- Footer: record count (left) and pagination (right).

## 3. Components (in order)

1. Left global navigation sidebar (nav list).
2. Global "Search records" field (top bar).
3. "All Leads" view selector (dropdown).
4. Toolbar: Filter, Sort, view-toggle icons, refresh (buttons/toggles).
5. "Create Lead" primary button + dropdown caret.
6. Filter panel: search box + "System Defined Filters" list (table/list).
7. Leads table (data grid) with a header checkbox + per-row checkboxes.
8. Footer: "Total Records 10" + pager ("1 to 10").

## 4. Default data shown

- Columns displayed (left→right): selection checkbox, **Lead Name** (has an
  "All" dropdown next to the header), **Company**, **Email**. Additional
  columns appear truncated at the right edge `[VERIFY]`.
  - `Lead Name` → no direct ERD field; ERD `Lead` stores `first_name` +
    `last_name`. Display composite. **ERD mismatch — flag.**
  - `Company` → ERD `Lead.company_name` (raw text). **Naming mismatch — flag.**
  - `Email` → ERD `Lead.email`. ✓
- **Proposed full column set** (only the first three are visible; the rest are
  derived from ERD `Lead` and assumed available via a column-picker / "manage
  columns" function that controls per-user visibility). Confirm the default-on
  set `[VERIFY]`:
  - Lead Name — display composite of `first_name` + `last_name`
  - Company — `company_name`
  - Email — `email`
  - Phone — `phone`
  - Lead Source — `source` (FK → LeadSource)
  - Lead Status — `status` (new/contacted/qualified/lost/converted)
  - Lead Owner — `owner` (FK → User)
  - Created Time — `created_at`
- Rows are Zoho **sample** data (each labeled "(Sample)"): Christopher Maclead,
  Carissa Kidman, James Merced, Tresa Sweely, Felix Hirpara, Kayleigh Lace —
  each with a company and a `*.invalid` sample email.
- Default sort / grouping: not indicated on screen `[VERIFY]`.
- Default page size: footer shows "Total Records 10" / "1 to 10"; only 10
  records exist, so page size is not determinable here `[VERIFY]`.

## 5. Filters / search / sort

- Filter panel open: a "Filter Leads by" search box and a "System Defined
  Filters" list — visible entries: Activities, Cadences, Campaigns, Latest
  Email Status, Locked, Record Action, Related Records Action, Touched Records.
  These are Zoho-native system filters; **none map to our ERD** — treat as
  out-of-scope unless we choose to implement equivalents `[VERIFY]`.
- Search: a global "Search records" field is present (top bar). Whether it maps
  to our list `q` param (name + email + phone) is not shown `[VERIFY]`.
- Sort: a **Sort** button exists; the active sort field/direction is not shown
  `[VERIFY]`.
- View toggles: multiple view-mode icons present in the toolbar (e.g. list vs.
  chart vs. other layouts) `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   | Create Lead | "Create Lead" button | `POST /api/leads/` | Opens create form |
| Primary   | (Create dropdown) | caret beside Create Lead | — | Options not visible here `[VERIFY]` (see create-dropdown screenshot) |
| Secondary | Filter | toolbar | client-side `?<field>=` `[VERIFY]` | Opens filter panel |
| Secondary | Sort | toolbar | `?ordering=` `[VERIFY]` | |
| Secondary | Switch view | toolbar view-toggle icons | route change `[VERIFY]` | |
| Secondary | Refresh | toolbar | re-fetch list | |
| Secondary | Search | global field | `?q=` `[VERIFY]` | |
| Row       | Open record | click a row / Lead Name | `GET /api/leads/{id}/` | Not confirmed on screen `[VERIFY]` |
| Bulk      | (selection actions) | header + row checkboxes present | — | No bulk-action bar visible `[VERIFY]` |
| Hidden / overflow | — | — | — | Truncated right-edge columns/icons `[VERIFY]` |

## 7. States

- **Default:** 10 sample leads in a table with the filter panel open.
- **Empty:** not shown `[VERIFY]`.
- **Loading:** not shown `[VERIFY]` (best-practices: skeleton/spinner, no blank
  screen).
- **Error:** not shown `[VERIFY]` (DRF `{ detail }` / field errors).
- **Filtered (no results):** not shown `[VERIFY]`.

## 8. RBAC notes

- Record visibility scope is not indicated on screen `[VERIFY]`. Per
  best-practices, list results should be scoped object-level (own + role-shared)
  in `get_queryset()`.
- Role-gated actions/fields: not determinable from the screenshot `[VERIFY]`.

## 9. Validation behavior

n/a (list view — no input fields beyond search/filter).

## 10. Performance notes

- List joins: `select_related` for `owner` and `source` FKs; `prefetch_related`
  for any reverse/m2m surfaced in extra columns. Watch N+1.
- Indexed columns for any filter/sort surfaced here: depends on which columns/
  filters we adopt `[VERIFY]`.
- Pagination: default 25, max 100 (sample set is only 10 records).

## 11. Open questions

- [ ] [VERIFY] Which additional columns are truncated at the right edge?
- [ ] [VERIFY] Default sort field and direction for "All Leads".
- [ ] [VERIFY] Default page size (sample data has only 10 records).
- [ ] [VERIFY] Does the global "Search records" field map to the list `q`
      param, or is it a separate global search?
- [ ] [VERIFY] Are bulk actions available on selection? No action bar is shown.
- [ ] [VERIFY] Row click behavior (open detail vs. inline) and hover affordances.
- [ ] [VERIFY] Which "System Defined Filters" (if any) do we implement, given
      none map to the ERD?
- [ ] [VERIFY] Record-visibility/RBAC scope behind "All Leads".
- [ ] **ERD mismatch:** column "Lead Name" has no single ERD field
      (`first_name` + `last_name`); confirm display-composite handling.
- [ ] **ERD naming:** column "Company" vs. ERD `Lead.company_name` (raw text).
