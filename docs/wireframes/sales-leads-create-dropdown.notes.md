# Leads — Create Lead split-button dropdown — notes

> Source screenshot: `sales-leads-create-dropdown.png`
> Module: Leads · Screen type: list (with create-dropdown overlay)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Reach alternate lead-creation / import paths from the **Create Lead** split
button's dropdown, without leaving the list. Primary actor: a sales user (some
items are likely admin/manager-gated `[VERIFY]`).

## 2. Layout regions

- Left global nav.
- List view behind the overlay (All Leads, toolbar, leads table, footer).
- **Create Lead** split button (top right) with its **caret dropdown open**.

## 3. Components (in order)

1. Left global navigation sidebar.
2. List toolbar (All Leads, Filter, Sort, view toggles, refresh).
3. **Create Lead** split button + open dropdown menu.
4. Dropdown menu items.
5. Leads table behind (Lead Name, Company, Email, **Phone** columns visible).

## 4. Default data shown

Dropdown menu items (visible, in order):

1. **Import Leads**
2. **Import Notes**
3. **Facebook Ads Sync**
4. **LinkedIn Ads Sync**
5. **TikTok Ads Sync**

The list behind shows the same 10 sample rows; note the **Phone** column is
visible here (→ ERD `Lead.phone` ✓), in addition to Lead Name / Company / Email.

ERD / API mapping:
- **Import Leads** → bulk lead creation. **No bulk-import endpoint in the API
  contract** — would need design `[VERIFY]`.
- **Import Notes** → bulk `Note` import; same gap `[VERIFY]`.
- **Facebook / LinkedIn / TikTok Ads Sync** → external ad-platform
  integrations. Not in ERD or API contract — **likely out of scope** `[VERIFY]`.

## 5. Filters / search / sort

Inherited from the list view (see `sales-leads-filter-options.notes.md`); the
dropdown itself adds none.

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   | Create Lead | split button (main) | `POST /api/leads/` | Opens create form |
| Secondary | Import Leads | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Secondary | Import Notes | dropdown | — | Bulk import; no endpoint yet `[VERIFY]` |
| Secondary | Facebook Ads Sync | dropdown | — | External integration; out of scope? `[VERIFY]` |
| Secondary | LinkedIn Ads Sync | dropdown | — | External integration; out of scope? `[VERIFY]` |
| Secondary | TikTok Ads Sync | dropdown | — | External integration; out of scope? `[VERIFY]` |

## 7. States

- **Default:** dropdown open over a populated list.
- **Empty / Loading / Error / Filtered:** governed by the underlying list view,
  not this overlay `[VERIFY]`.

## 8. RBAC notes

- Import and ad-sync actions are typically admin/manager-gated `[VERIFY]`.
- Create Lead availability follows list-view create permissions `[VERIFY]`.

## 9. Validation behavior

n/a for the menu itself. Import flows would need their own file-format /
field-mapping validation `[VERIFY]`.

## 10. Performance notes

- Bulk import should be chunked / backgrounded if implemented `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Which dropdown items are in scope? None map to the current API
      contract; ad-sync items are external integrations.
- [ ] [VERIFY] Bulk import endpoint design (Import Leads / Import Notes).
- [ ] [VERIFY] RBAC gating for import / sync actions.
