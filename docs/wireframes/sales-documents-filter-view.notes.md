# Documents — file-type filter menu — notes

> Source screenshot: `sales-documents-filter-view.png`
> Module: Documents · Screen type: menu/overlay (filter, over empty list)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> ⚠️ **Not in our data model** — see `sales-documents-landing page.notes.md`.
> No Document entity in the ERD, no documents resource in the API contract.
> Scope decision required before any spec `[VERIFY]`.

## 1. Purpose

Narrow the Documents list to a single file type via the **filter** menu.
Primary actor: a sales user `[VERIFY]`.

## 2. Layout regions

- Same Documents two-pane layout as the landing page.
- A **filter dropdown menu** is open, anchored to the top-right filter icon.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Folder tree pane (My Folders, Team Folders, Open WorkDrive).
3. Breadcrumb (Apps › Zoho CRM).
4. Toolbar icons (sort, filter [open], view-mode, info).
5. **Open filter menu** (file-type list).
6. File list area behind (empty — "No items available.").

## 4. Default data shown

Filter menu options (visible, in order): **All** (checked), **Folders**,
**Documents**, **Spreadsheets**, **Presentations**, **PDF**, **Images**,
**Audio**, **Videos**, **Links**.

- These are **file-type categories**, not ERD fields. If Documents is built,
  this implies a `type`/`category` attribute on a file entity `[VERIFY]`.
- "All" is the default selection.

## 5. Filters / search / sort

- This menu **is** the file-type filter (single-select; "All" = no filter)
  `[VERIFY]` (multi-select not indicated).
- Sort and view-mode icons sit beside it (not opened here).

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Secondary | Filter by file type | select a menu option | — | No endpoint; depends on scope `[VERIFY]` |
| Secondary | Reset filter | select "All" | — | Default |

## 7. States

- **Default:** filter menu open with "All" checked; list behind is empty.
- **Filtered (no results):** would show the same empty illustration `[VERIFY]`.
- **Loading / Error:** not shown `[VERIFY]`.

## 8. RBAC notes

- Filtering does not change access; folder/file permissions still apply
  (team-folder lock) `[VERIFY]`.

## 9. Validation behavior

n/a (selection menu).

## 10. Performance notes

- File-type filter should be a server-side query param if implemented natively
  `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] **Documents scope** (no ERD entity / no API resource).
- [ ] [VERIFY] Single- vs. multi-select file-type filter.
- [ ] [VERIFY] Whether "Folders" is a type filter or a grouping toggle.
