# Leads — create lead form — notes

> Source screenshot: `sales-leads-create-new leads.png`
> Module: Leads · Screen type: create/edit
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

Create a new lead by filling in the "Lead Information" form. Primary actor: a
sales user (owner defaults to the current user). Same form likely backs Edit
`[VERIFY]`.

## 2. Layout regions

- Left global nav.
- Page header: **"Create Lead"** + an **"Edit Page Layout"** link; right side:
  **Cancel**, **Save and New**, **Save**.
- Main content: a **"Lead Information"** section laid out as a two-column form.
- Right edge: a vertical **"Client Script"** tab (Zoho dev feature — out of
  scope `[VERIFY]`).

## 3. Components (in order)

1. Left global navigation sidebar.
2. Page header + "Edit Page Layout" link.
3. Cancel / Save and New / Save buttons.
4. "Lead Information" section heading.
5. Two-column field grid.
6. "Client Script" side tab.

## 4. Default data shown

Form is empty on load except **Lead Owner** (prefilled with the current user).
Fields visible (left column, then right column):

Left: **Lead Owner**, **First Name** (salutation `-None-` dropdown + text),
**Title**, **Phone**, **Mobile**, **Lead Source** (`-None-`), **Industry**
(`-None-`).
Right: **Company** (required *), **Last Name** (required *), **Email**, **Fax**,
**Website**, **Lead Status** (`-None-`), **No. of Employees**.

Map to ERD `Lead` (and flag mismatches):

- Lead Owner → `owner` (FK → User). ✓
- First Name → `first_name` ✓; **salutation dropdown** has no ERD field — flag.
- Last Name (required) → `last_name`. ✓
- Company (required) → `company_name` (raw text). Naming mismatch — flag.
- Email → `email`. ✓
- Phone → `phone`. ✓
- Lead Source → `source` (FK → LeadSource). ✓
- Lead Status → `status`. ✓
- **Mobile** → no ERD field. **Flag.**
- **Title** → no ERD field on `Lead`. **Flag.**
- **Fax** → no ERD field. **Flag.**
- **Website** → no ERD field on `Lead` (exists on `Company`). **Flag.**
- **Industry** → no ERD field on `Lead` (exists on `Company`). **Flag.**
- **No. of Employees** → no ERD field on `Lead` (`Company.employee_count`).
  **Flag.**

## 5. Filters / search / sort

n/a (form). The Lead Owner picker and the Lead Source / Lead Status / Industry
dropdowns imply lookups against their option sets `[VERIFY]` (sources for
Source/Status/Industry option lists not shown).

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   | Save | "Save" button | `POST /api/leads/` | Then go to detail `[VERIFY]` |
| Primary   | Save and New | "Save and New" | `POST /api/leads/` | Then reset form for next entry |
| Secondary | Cancel | "Cancel" button | back to list | Discards input `[VERIFY]` |
| Secondary | Edit Page Layout | header link | layout config | Admin-only `[VERIFY]` |

## 7. States

- **Default:** empty form; Lead Owner prefilled; Company + Last Name marked
  required.
- **Empty:** n/a.
- **Loading:** save-in-progress state not shown `[VERIFY]` (disable submit /
  spinner).
- **Error:** field validation — backend returns `{ field: ["msg"] }` (DRF);
  mirror in the zod schema. Specific rules not shown `[VERIFY]`.
- **Filtered:** n/a.

## 8. RBAC notes

- Who may create leads is not shown `[VERIFY]`. Owner defaults to current user.
- "Edit Page Layout" is an admin/config action `[VERIFY]`.

## 9. Validation behavior

- **Required (red asterisk visible): Company, Last Name.** All other fields
  appear optional `[VERIFY]`.
- Format/constraint rules (email format, phone/mobile/fax patterns, website URL,
  No. of Employees numeric, `max_length` per field) not shown `[VERIFY]`.
- Inline vs. submit-time validation timing not shown `[VERIFY]`.
- zod schema must mirror the serializer (best-practices invariant).

## 10. Performance notes

- Lightweight create; no list joins. Option-list dropdowns (Source/Status/
  Industry) and the user picker should be cached/lookup endpoints `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Several visible fields are not in the ERD `Lead` model: Mobile,
      Title, Fax, Website, Industry, No. of Employees, Salutation. Extend the
      model, move to a related entity, or drop from the form?
- [ ] [VERIFY] Required-field set beyond the two shown (Company, Last Name).
- [ ] [VERIFY] Option sources for Lead Source / Lead Status / Industry.
- [ ] [VERIFY] Does this same form back Edit, and does it show below-the-fold
      sections (only "Lead Information" is visible)?
- [ ] [VERIFY] Post-save navigation (detail vs. list) and Cancel behavior.
- [ ] [VERIFY] "Edit Page Layout" — in scope, and admin-gated?
