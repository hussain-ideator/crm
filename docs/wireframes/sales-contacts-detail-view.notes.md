# Contacts — detail view — notes

> Source screenshot: `sales-contacts-detail-view.png`
> Module: Contacts · Screen type: detail
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

View a single contact's profile, see related records (deals, activities), and
act (send email, edit). Primary actor: the contact's owner / a sales user
`[VERIFY]`.

## 2. Layout regions

- Left global nav (Sales group; Contacts selected).
- Record header: name **"Leota Dilliard (Sample)"**, account **"Commercial
  Press (Sample)"**, **"+ Add Tags"**; right: **Send Email**, **Edit**,
  overflow, prev/next; **"Last Update: 10:45 AM"**.
- Left "Related List" panel.
- Main: **Overview / Timeline** tabs + field block + a **"Next Action"** strip.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Record header (name, account, Add Tags).
3. Action buttons: Send Email, Edit, overflow, prev/next.
4. "Related List" panel.
5. Overview / Timeline tabs.
6. Field detail block.
7. "Next Action" strip (e.g. "JAN 13 — Get Approval from Manager").

## 4. Default data shown

Fields visible (map to ERD `Contact`):

- **Contact Owner:** mohamedalihussain.hm → `owner`. ✓
- **Email:** leota-dillard@noemail.invalid → `email`. ✓
- **Phone:** 555-555-5555 → `phone`. ✓
- **Mobile:** 555-555-5555 → **no ERD field** (Contact has only `phone`). Flag.
- **Department:** Management → **no ERD field** (ERD has `title`, not
  `department`). Flag.
- Header name → `first_name` + `last_name`; account "Commercial Press" →
  `company_fk → Company`.
- `title` (ERD field) is **not** shown here `[VERIFY]`.

Related List entries (visible): **Notes, Connected Records, Attachments,
Cadences, Deals (1), Open Activities (1), Closed Activities (1), Invited
Meetings, Products, Cases, Sales Orders** (list truncated).
- Map: Notes → `Note` ✓; Attachments → `Attachment` ✓; Deals →
  `primary_contact_fk` on `Deal` ✓; Open/Closed Activities → `Activity` ✓.
- **Not in ERD:** Connected Records, Cadences, Invited Meetings, Products,
  Cases, Sales Orders. Flag / decide scope `[VERIFY]`.

The **"Next Action"** strip implies a reminder/activity surfaced on the record
`[VERIFY]` (data source not confirmed).

## 5. Filters / search / sort

n/a (single record). Overview vs. Timeline tabs `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Send Email | "Send Email" | — | No email endpoint in contract `[VERIFY]` |
| Secondary | Edit | "Edit" | `PATCH`/`PUT /api/contacts/{id}/` | |
| Secondary | Add Tags | "+ Add Tags" | — | Tags not in ERD `[VERIFY]` |
| Secondary | Prev/Next | header arrows | sibling `{id}` | |
| Secondary | Jump to related list | left panel | nested fetch | |
| Hidden/overflow | overflow menu | "..." | — | Contents not visible `[VERIFY]` |

## 7. States

- **Default:** populated sample contact (Overview).
- **Empty / Loading / Error:** not shown `[VERIFY]`; 404 → DRF `{ detail }`.
- **Filtered:** n/a.

## 8. RBAC notes

- Owner shown; object-level scope (own + role-shared) per best-practices,
  enforced in `get_queryset()`; on-screen scope not confirmed `[VERIFY]`.

## 9. Validation behavior

n/a (read view; edits via the contact form).

## 10. Performance notes

- Detail fetch: `select_related` for `owner`, `company`.
- Related lists (Deals, Activities, Notes) load lazily / `prefetch_related`
  `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] "Mobile" and "Department" — extend `Contact` model or drop?
- [ ] [VERIFY] `title` (ERD) absent from this layout — included elsewhere?
- [ ] [VERIFY] "Next Action" strip data source (activity/reminder).
- [ ] [VERIFY] Which related lists are in scope (several Zoho-native).
- [ ] [VERIFY] Tags, overflow menu contents, RBAC scope.
