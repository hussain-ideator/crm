# Contacts — toolbar overflow ("...") menu — notes

> Source screenshot: `sales-contacts-moreinfo-threedots.png`
> Module: Contacts · Screen type: menu/overlay (over list view)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Reach record-set / bulk operations and alternate views via the toolbar
**overflow ("...")** menu beside Create Contact. This is the source of the
**bulk actions** referenced as `[VERIFY]` in the contacts list notes. Actor: a
sales user; destructive/mass actions likely Manager/Admin-gated `[VERIFY]`.

## 2. Layout regions

- Left global nav.
- Contacts list behind the overlay.
- **Create Contact** + overflow "..." with the **menu open**.

## 3. Components (in order)

1. Left global navigation sidebar.
2. List toolbar (All Contacts, Filter, Sort, view toggles, refresh).
3. Create Contact + overflow "..." trigger.
4. Open overflow menu.
5. Contacts table behind.

## 4. Default data shown

Overflow menu items (visible, in order):

1. **Mass Delete**
2. **Mass Update**
3. **Manage Tags**
4. **Drafts**
5. **Mass Email**
6. **Deduplicate Contacts**
7. **Add to Campaigns**
8. **Create Client Script**
9. **Export Contacts**
10. *(separator)* **Zoho Sheet View**
11. **Print View**

ERD / API mapping:
- **Mass Delete** → bulk soft-delete (per-record `DELETE /api/contacts/{id}/`;
  no bulk variant in contract) `[VERIFY]`.
- **Mass Update** → bulk `PATCH` `[VERIFY]`.
- **Deduplicate Contacts** → not in contract `[VERIFY]`.
- **Export Contacts** → no export endpoint `[VERIFY]`.
- **Manage Tags / Drafts / Mass Email / Add to Campaigns** → tags, drafts,
  email, and Campaign are **not in our ERD/contract** `[VERIFY]`.
- **Create Client Script / Zoho Sheet View / Print View** → Zoho-native
  platform features; **out of scope** `[VERIFY]`.

## 5. Filters / search / sort

n/a for the menu; bulk actions presumably operate on the current
selection/filter `[VERIFY]`.

## 6. Actions

| Type | Action | Endpoint or route | Notes |
|------|--------|-------------------|-------|
| Bulk | Mass Delete | bulk soft-delete `[VERIFY]` | Destructive |
| Bulk | Mass Update | bulk `PATCH` `[VERIFY]` | |
| Bulk | Deduplicate Contacts | — `[VERIFY]` | Not in contract |
| Bulk | Export Contacts | — `[VERIFY]` | No endpoint |
| Bulk | Manage Tags / Drafts / Mass Email / Add to Campaigns | — `[VERIFY]` | Not in ERD |
| Other | Create Client Script / Zoho Sheet View / Print View | — | Platform/out of scope `[VERIFY]` |

## 7. States

- **Default:** menu open over a populated list.
- Per-action confirm/progress dialogs not shown `[VERIFY]`.

## 8. RBAC notes

- Destructive/mass/export actions should be Manager/Admin-gated `[VERIFY]`.
- Object-level scope still applies to which records a bulk action may touch.

## 9. Validation behavior

n/a for the menu; each action carries its own confirm/validation `[VERIFY]`.

## 10. Performance notes

- Bulk operations should be batched/backgrounded and paginated server-side
  `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Which actions are in scope for v1?
- [ ] [VERIFY] No bulk/export endpoints exist in the contract — need design.
- [ ] [VERIFY] Tags / Drafts / Campaigns / Email not in ERD.
- [ ] [VERIFY] Selection model + RBAC gating per action.
