# Contacts — list + Create Contact dropdown — notes

> Source screenshot: `sales-contacts-create-dropdown.png`
> Module: Contacts · Screen type: list (with create-dropdown overlay)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Browse/filter the Contacts list and reach create/import paths via the **Create
Contact** split button. Primary actor: a sales user `[VERIFY]`.

## 2. Layout regions

- Left global nav.
- Sub-toolbar: **All Contacts** selector, Filter, Sort, view toggles, refresh;
  **Create Contact** split button + open dropdown.
- Left filter panel ("Filter Contacts by" + System Defined Filters).
- Main: contacts table; footer with count + pager.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Toolbar (All Contacts, Filter, Sort, view toggles, refresh).
3. Create Contact split button + open dropdown.
4. Filter panel (search + System Defined Filters).
5. Contacts table (header + per-row checkboxes).
6. Footer: "Total Records 10" + pager ("1 to 10").

## 4. Default data shown

- Columns (left→right): selection checkbox, a small **date** column (shows
  "Today / Jun 14 / Jun 11" badges) `[VERIFY]` (likely created/modified date),
  **Contact Name** (with "All" dropdown), **Account Name**, and **Email**
  (truncated at right edge).
  - Contact Name → `first_name` + `last_name` (display composite).
  - Account Name → `company_fk → Company.name`.
  - Email → `Contact.email` ✓.
- **Proposed full column set** (column-picker controlled, derived from ERD
  `Contact` — confirm default-on set `[VERIFY]`): Contact Name, Account Name,
  Email, Phone, Title, Contact Owner, Created Time.
- Rows are Zoho sample data: Kris Marrier, Sage Wieser, Leota Dillard, Mitsue
  Tollner, Simon Morasca, Donette Foller. "Total Records 10".
- Dropdown items (visible): **Import Contacts**, **Import Notes**.

## 5. Filters / search / sort

- Filter panel open with "System Defined Filters" (Activities, Cadences,
  Campaigns, Latest Email Status, Locked, Record Action, Related Records Action,
  Touched Records) — Zoho-native, **none map to ERD** `[VERIFY]`.
- Global "Search records" present (maps to `q` = name+email+phone?) `[VERIFY]`.
- Sort button present; default sort not shown `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Create Contact | split button | `POST /api/contacts/` | |
| Secondary | Import Contacts | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Secondary | Import Notes | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Row       | Open record | row / Contact Name | `GET /api/contacts/{id}/` | `[VERIFY]` |
| Bulk      | (selection actions) | checkboxes present | — | See `sales-contacts-moreinfo-threedots` |

## 7. States

- **Default:** 10 sample contacts; dropdown open.
- **Empty / Loading / Error / Filtered:** not shown `[VERIFY]`.

## 8. RBAC notes

- Object-level scope (own + role-shared) per best-practices `[VERIFY]`.
- Import likely admin/manager-gated `[VERIFY]`.

## 9. Validation behavior

n/a (list/menu). Import would need file-format/mapping validation `[VERIFY]`.

## 10. Performance notes

- List joins: `select_related` `owner`, `company`. Watch N+1.
- Indexes on any filter/sort columns adopted `[VERIFY]`.
- Pagination default 25 / max 100.

## 11. Open questions

- [ ] [VERIFY] Identity of the small date column (created vs. modified).
- [ ] [VERIFY] Default-on column set and default sort.
- [ ] [VERIFY] Search `q` mapping; which System Defined Filters in scope.
- [ ] [VERIFY] Bulk import endpoint design; RBAC gating.
