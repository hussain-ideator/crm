# Leads — toolbar overflow ("...") menu — notes

> Source screenshot: `sales-leads-more-info-threedots.png`
> Module: Leads · Screen type: menu/overlay (over chart view)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Reach record-set / bulk operations via the toolbar **overflow ("...")** menu
beside Create Lead. This is the source of the **bulk actions** that were a
`[VERIFY]` in `sales-leads-filter-options.notes.md`. Primary actor: a sales
user; destructive/mass actions likely Manager/Admin-gated `[VERIFY]`.

## 2. Layout regions

- Left global nav.
- Chart view in the background (this menu is shown over the chart view, not the
  table — see `sales-leads-chart-view.notes.md`).
- Toolbar with **Create Lead** + overflow **"..."**; the **overflow menu is
  open**.

## 3. Components (in order)

1. Left global navigation sidebar.
2. View toolbar (Filter, Sort, view toggles incl. chart, refresh).
3. **Create Lead** button + overflow "..." trigger.
4. Open overflow menu.
5. Chart view behind (Group By Created Time, Measure Count).

## 4. Default data shown

Overflow menu items (visible, in order):

1. **Mass Delete**
2. **Mass Update**
3. **Mass Convert**
4. **Manage Tags**
5. **Drafts**
6. **Mass Email**
7. **Approve Leads**
8. **Deduplicate Leads**
9. **Add to Campaigns**
10. **Export Leads**

ERD / API mapping (most operate on a selected set of leads):
- **Mass Delete** → bulk soft-delete (`DELETE /api/leads/{id}/` is per-record;
  no bulk variant in contract) `[VERIFY]`.
- **Mass Update** → bulk `PATCH` `[VERIFY]`.
- **Mass Convert** → bulk `POST /api/leads/{id}/convert/` `[VERIFY]`.
- **Manage Tags** → tags not in ERD `[VERIFY]`.
- **Drafts** → not in ERD / contract `[VERIFY]`.
- **Mass Email** → no email endpoint in contract; external `[VERIFY]`.
- **Approve Leads** → approval workflow not in ERD `[VERIFY]`.
- **Deduplicate Leads** → not in contract `[VERIFY]`.
- **Add to Campaigns** → `Campaign` not in our ERD `[VERIFY]`.
- **Export Leads** → no export endpoint in contract `[VERIFY]`.

## 5. Filters / search / sort

n/a for the menu. Bulk actions presumably operate on the current
selection/filter `[VERIFY]` (selection mechanism not shown in this view).

## 6. Actions

| Type | Action | Trigger / location | Endpoint or route | Notes |
|------|--------|--------------------|-------------------|-------|
| Bulk | Mass Delete | overflow menu | bulk soft-delete `[VERIFY]` | Destructive |
| Bulk | Mass Update | overflow menu | bulk `PATCH` `[VERIFY]` | |
| Bulk | Mass Convert | overflow menu | bulk convert `[VERIFY]` | |
| Bulk | Manage Tags | overflow menu | — | Tags not in ERD `[VERIFY]` |
| Bulk | Drafts | overflow menu | — | Not in ERD/contract `[VERIFY]` |
| Bulk | Mass Email | overflow menu | — | No endpoint `[VERIFY]` |
| Bulk | Approve Leads | overflow menu | — | Approval workflow `[VERIFY]` |
| Bulk | Deduplicate Leads | overflow menu | — | Not in contract `[VERIFY]` |
| Bulk | Add to Campaigns | overflow menu | — | Campaign not in ERD `[VERIFY]` |
| Bulk | Export Leads | overflow menu | — | No export endpoint `[VERIFY]` |

## 7. States

- **Default:** menu open over the chart view.
- **Empty / Loading / Error:** not applicable to the menu; depend on the
  underlying view and on per-action confirm/progress dialogs `[VERIFY]`.

## 8. RBAC notes

- Destructive/mass actions (Mass Delete, Mass Update, Mass Convert, Approve,
  Export) should be Manager/Admin-gated `[VERIFY]`.
- Object-level scope still applies: a bulk action must only touch records the
  user may access (`get_queryset()`).

## 9. Validation behavior

n/a for the menu. Each action would carry its own confirmation/validation
(e.g. Mass Update field selection, Mass Delete confirm) `[VERIFY]`.

## 10. Performance notes

- Bulk operations should be batched / backgrounded and paginated server-side to
  avoid long-running requests `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Which of these 10 actions are in scope for v1?
- [ ] [VERIFY] None have bulk endpoints in the API contract — need bulk endpoint
      design (delete/update/convert) and decisions on export/email/approve.
- [ ] [VERIFY] Tags, Drafts, Campaigns, Approval are not in the ERD.
- [ ] [VERIFY] Selection model that feeds these bulk actions.
- [ ] [VERIFY] RBAC gating per action.
