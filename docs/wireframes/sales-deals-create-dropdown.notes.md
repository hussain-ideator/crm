# Deals — list + Create Deal dropdown — notes

> Source screenshot: `sales-deals-create-dropdown.png`
> Module: Deals · Screen type: list (with create-dropdown overlay)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Browse/filter the Deals list (flat table) and reach create/import paths via the
**Create Deal** split button. Primary actor: a sales user `[VERIFY]`.

## 2. Layout regions

- Left global nav (Deals selected).
- Sub-toolbar: **All Deals** selector, Filter, Sort, view toggles (list
  active), refresh; **Create Deal** split button + open dropdown.
- Left filter panel ("Filter Deals by" + System Defined Filters).
- Main: deals table; footer count + pager.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Toolbar (All Deals, Filter, Sort, view toggles, refresh).
3. Create Deal split button + open dropdown.
4. Filter panel.
5. Deals table (header + per-row checkboxes).
6. Footer: "Total Records 10" + pager ("1 to 10").

## 4. Default data shown

- Columns (left→right): selection checkbox, **Deal Name** (with "All"
  dropdown), **Amount**, and **Stage** (truncated at right edge).
  - Deal Name → `Deal.name`. ✓
  - Amount → `Deal.amount` (+ `currency`; Rs./INR shown). ✓
  - Stage → `stage_fk`. ✓
- **Proposed full column set** (column-picker controlled, from ERD `Deal` —
  confirm default-on set `[VERIFY]`): Deal Name, Amount, Stage, Close Date,
  Account/Company, Primary Contact, Deal Owner, Probability, Created Time.
- Rows (sample): King (Rs. 60.00), Truhlar And Truhlar Attys (Rs. 45,000.00,
  Needs Analysis), Commercial Press (Closed Lost), Morlong Associates (Closed
  Won), Chapman (Negotiation/Review), Printing Dimensions (Proposal/Price
  Quote), Feltz Printing Service (Id. Decision Makers). "Total Records 10".
- Dropdown items (visible): **Import Deals**, **Import Notes**.

Stage values seen (Qualification, Needs Analysis, Proposal/Price Quote,
Negotiation/Review, Id. Decision Makers, Closed Won, Closed Lost) populate the
ERD `Stage` table per pipeline `[VERIFY]` (confirm canonical stage list).

## 5. Filters / search / sort

- Filter panel + System Defined Filters (Zoho-native; not in ERD) `[VERIFY]`.
- Global search → `q` `[VERIFY]`. Sort button present; default not shown
  `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Create Deal | split button | `POST /api/deals/` | |
| Secondary | Import Deals | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Secondary | Import Notes | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Row       | Open record | row / Deal Name | `GET /api/deals/{id}/` | `[VERIFY]` |
| Bulk      | (selection actions) | checkboxes present | — | Overflow menu not captured for Deals `[VERIFY]` |

## 7. States

- **Default:** 10 sample deals; dropdown open.
- **Empty / Loading / Error / Filtered:** not shown `[VERIFY]`.

## 8. RBAC notes

- Object-level scope (own + role-shared) per best-practices `[VERIFY]`.
- Import likely admin/manager-gated `[VERIFY]`.

## 9. Validation behavior

n/a (list/menu).

## 10. Performance notes

- List joins: `select_related` `owner`, `company`, `primary_contact`, `stage`,
  `pipeline`. Watch N+1.
- Index `stage_fk`, `close_date`, and any sort columns adopted `[VERIFY]`.
- Pagination default 25 / max 100.

## 11. Open questions

- [ ] [VERIFY] Default-on column set and default sort.
- [ ] [VERIFY] Canonical Stage list / pipeline seed data.
- [ ] [VERIFY] Bulk import endpoint design; Deals overflow (bulk) menu contents.
- [ ] [VERIFY] Search `q` mapping; which System Defined Filters in scope.
