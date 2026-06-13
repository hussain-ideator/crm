# Documents — landing page (empty state) — notes

> Source screenshot: `sales-documents-landing page.png`
> Module: Documents · Screen type: list (folder browser, empty state)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> ⚠️ **Not in our data model.** There is **no Document/Folder entity in
> `docs/erd.md`** and **no documents resource in `docs/api-contract.md`**. The
> ERD's closest concept is `Attachment` (a generic relation to a parent record),
> which is **not** the same as a standalone file/folder manager. This screen is
> backed by Zoho **WorkDrive** ("Open WorkDrive" link). **Scope decision needed
> before any spec** `[VERIFY]`.

## 1. Purpose

Browse a folder tree of files (personal + team folders) and open/manage
documents. Primary actor: a sales user `[VERIFY]`. As shown, the area is empty.

## 2. Layout regions

- Left global nav.
- Two-pane content: **left** = folder tree (**My Folders**; **TEAM FOLDERS** →
  "Zoho CRM" with a lock icon) + an **"Open WorkDrive"** link; **right** = file
  list area with a breadcrumb (**Apps › Zoho CRM**) and top-right **sort /
  filter / view** icons + an info icon.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Top bar + global "Search records".
3. Folder tree pane (My Folders, Team Folders, Open WorkDrive).
4. Breadcrumb (Apps › Zoho CRM).
5. Toolbar icons (sort, filter, view-mode, info).
6. File list area (currently empty).

## 4. Default data shown

- **Empty state:** an illustration + **"No items available."**
- Folder tree: "My Folders", "TEAM FOLDERS → Zoho CRM" (locked).
- No file rows. Columns/metadata for a populated state are **not visible**
  `[VERIFY]` (expected: name, type, size, owner, modified date).

## 5. Filters / search / sort

- A **filter** icon (file-type filter — see `sales-documents-filter-view.png`),
  a **sort** icon, and a **view-mode** icon are present.
- Global "Search records" field present `[VERIFY]` (scope unknown for files).

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Add / upload | "+" (top bar) `[VERIFY]` | — | No documents endpoint in contract |
| Secondary | Open WorkDrive | left-pane link | external (WorkDrive) | Out of our app `[VERIFY]` |
| Secondary | Sort / Filter / change view | toolbar icons | — | `[VERIFY]` |
| Secondary | Navigate folders | folder tree / breadcrumb | — | `[VERIFY]` |

## 7. States

- **Empty:** shown — illustration + "No items available." (this is the captured
  state).
- **Default (populated):** not shown `[VERIFY]`.
- **Loading / Error:** not shown `[VERIFY]`.
- **Filtered (no results):** likely same empty illustration `[VERIFY]`.

## 8. RBAC notes

- Team folder shows a **lock** icon → folder-level access control `[VERIFY]`.
- Personal ("My Folders") vs. shared ("Team Folders") visibility split
  `[VERIFY]`.

## 9. Validation behavior

n/a as shown (no form). Upload would need file type/size validation `[VERIFY]`.

## 10. Performance notes

- If implemented natively, file listing needs pagination + lazy folder
  expansion `[VERIFY]`. If delegated to WorkDrive, this is an integration, not
  our storage `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] **Is Documents in scope at all?** No ERD entity / no API
      resource. Decide: build a native files/folders model, reuse `Attachment`,
      or defer to a WorkDrive integration.
- [ ] [VERIFY] Populated-state columns/metadata.
- [ ] [VERIFY] Folder permission model (lock icon).
- [ ] [VERIFY] Upload/add flow and validation.
