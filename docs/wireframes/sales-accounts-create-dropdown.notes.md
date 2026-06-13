# Accounts — list + Create Account dropdown — notes

> Source screenshot: `sales-accounts-create-dropdown.png`
> Module: Accounts · Screen type: list (with create-dropdown overlay)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> Note: the **Accounts** module maps to the ERD entity **`Company (Account)`**.
> Per the API contract the resource path is **`/api/companies/`**.

## 1. Purpose

Browse/filter the Accounts (companies) list and reach create/import paths via
the **Create Account** split button. Primary actor: a sales user `[VERIFY]`.

## 2. Layout regions

- Left global nav (Accounts selected).
- Sub-toolbar: **All Accounts** selector, Filter, Sort, view toggles, refresh;
  **Create Account** split button + open dropdown.
- Left filter panel ("Filter Accounts by" + System Defined Filters + "Filter By
  Fields").
- Main: accounts table; footer count + pager.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Toolbar (All Accounts, Filter, Sort, view toggles, refresh).
3. Create Account split button + open dropdown.
4. Filter panel (search + System Defined Filters + Filter By Fields).
5. Accounts table (header + per-row checkboxes; a row-hover overflow "..." is
   visible).
6. Footer: "Total Records 10" + pager ("1 to 10").

## 4. Default data shown

- Columns (left→right): selection checkbox, **Account Name** (with "All"
  dropdown), **Phone**, **Website**, and **owner** (truncated "mohamed…").
  - Account Name → `Company.name`. ✓
  - Phone → `Company.phone`. ✓
  - Website → `Company.website`. ✓
  - Owner → `Company.owner`. ✓
- **Proposed full column set** (column-picker controlled, from ERD `Company` —
  confirm default-on set `[VERIFY]`): Account Name, Phone, Website, Industry,
  Annual Revenue, Employee Count, Account Owner, Created Time. (`billing_address`
  / `shipping_address` likely detail-only `[VERIFY]`.)
- Rows (sample): King, Truhlar And Truhlar, Commercial Press, Morlong
  Associates, Chapman, Printing Dimensions — with phones + website URLs.
  "Total Records 10".
- Dropdown items (visible): **Import Accounts**, **Import Notes**.

## 5. Filters / search / sort

- Filter panel: "System Defined Filters" (Cadences, Locked, Record Action,
  Related Records Action, Touched Records, Untouched Records) + a **"Filter By
  Fields"** section. System-defined items are Zoho-native (not in ERD); "Filter
  By Fields" maps to our `?<field>=` params `[VERIFY]`.
- Global search → `q` `[VERIFY]`. Sort present; default not shown `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Create Account | split button | `POST /api/companies/` | |
| Secondary | Import Accounts | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Secondary | Import Notes | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Row       | Open record | row / Account Name | `GET /api/companies/{id}/` | `[VERIFY]` |
| Row       | Row overflow | hover "..." | — | Per-row actions not captured `[VERIFY]` |
| Bulk      | (selection actions) | checkboxes present | — | Overflow bulk menu not captured for Accounts `[VERIFY]` |

## 7. States

- **Default:** 10 sample accounts; dropdown open.
- **Empty / Loading / Error / Filtered:** not shown `[VERIFY]`.

## 8. RBAC notes

- Object-level scope (own + role-shared) per best-practices `[VERIFY]`.
- Import likely admin/manager-gated `[VERIFY]`.

## 9. Validation behavior

n/a (list/menu).

## 10. Performance notes

- List joins: `select_related` `owner`. Watch N+1.
- Index any filter/sort columns adopted `[VERIFY]`.
- Pagination default 25 / max 100.

## 11. Open questions

- [ ] [VERIFY] Default-on column set and default sort.
- [ ] [VERIFY] "Filter By Fields" → confirm which Company fields are filterable.
- [ ] [VERIFY] Row-hover overflow + bulk overflow menu contents for Accounts.
- [ ] [VERIFY] Bulk import endpoint design; RBAC gating.
