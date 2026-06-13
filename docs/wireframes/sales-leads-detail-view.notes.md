# Leads — detail view — notes

> Source screenshot: `sales-leads-detail-view.png`
> Module: Leads · Screen type: detail
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

View a single lead's full profile, move it through the lead-status process, and
act on it (send email, convert, edit, navigate related records). Primary actor:
the lead's owner / a sales user with access `[VERIFY]`.

## 2. Layout regions

- Left global nav (same as list).
- Record header: salutation + name **"Ms. Carissa Kidman (Sample)"**, company
  **"Oh My Goodknits Inc"**, **"+ Add Tags"**; right side: **Send Email**,
  **Convert**, **Edit**, overflow **"..."**, and prev/next record arrows;
  **"Last Update: 10:45 AM"**.
- Left "Related List" panel (in-page jump links to related sections).
- Main content: **Overview / Timeline** tabs, a **lead-status process strip**,
  and a field detail block.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Record header (name, company, Add Tags).
3. Action buttons: Send Email, Convert, Edit, overflow, prev/next.
4. "Related List" panel.
5. Overview / Timeline tabs.
6. Lead-status process strip.
7. Field detail block.

## 4. Default data shown

Fields visible in the detail block (map to ERD `Lead`):

- **Lead Owner:** mohamedalihussain.hm → `owner` (FK → User). ✓
- **Email:** carissa-kidman@noemail.invalid → `email`. ✓
- **Phone:** 555-555-5555 → `phone`. ✓
- **Mobile:** 555-555-5555 → **no ERD field.** ERD `Lead` has only `phone`.
  **ERD mismatch — flag.**
- **Lead Status:** "Contact in Future" → `status`. **Value mismatch:** ERD enum
  is `new/contacted/qualified/lost/converted`; the screen shows a richer set
  (see process strip below). **ERD mismatch — flag.**
- Header name "Ms. Carissa Kidman" → `first_name` + `last_name`; **"Ms."**
  salutation has no ERD field. **ERD mismatch — flag.**
- Header company "Oh My Goodknits Inc" → `company_name` (raw text).

Lead-status process strip values (visible): **Attempted to Contact**,
**Contact in Future**, **Contacted**, **Junk Lead**, **Lost Lead**, + a
trailing icon. None of these match the ERD status enum — reconcile `[VERIFY]`.

Related List panel entries (visible): **Notes, Connected Records, Cadences,
Attachments, Products, Open Activities, Closed Activities, Invited Meetings,
Emails, Campaigns, Social**.
- Map to ERD: Notes → `Note` ✓; Attachments → `Attachment` ✓; Open/Closed
  Activities → `Activity` (task/call/meeting) ✓.
- **Not in ERD:** Connected Records, Cadences, Products, Invited Meetings,
  Emails, Campaigns, Social — Zoho-native. **Flag / decide scope `[VERIFY]`.**

## 5. Filters / search / sort

n/a (single record). Overview vs. Timeline tabs switch detail vs. history view
`[VERIFY]` (Timeline content not shown).

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   | Convert | "Convert" button | `POST /api/leads/{id}/convert/` | To Deal / Contact / Company per ERD |
| Primary   | Send Email | "Send Email" button | — | No email endpoint in API contract `[VERIFY]` |
| Secondary | Edit | "Edit" button | `PATCH`/`PUT /api/leads/{id}/` | Opens edit form |
| Secondary | Add Tags | "+ Add Tags" | — | Tags not in ERD `[VERIFY]` |
| Secondary | Prev / Next record | header arrows | route to sibling `{id}` | |
| Secondary | Jump to related list | left panel | nested resource fetch | e.g. notes/activities/attachments |
| Hidden / overflow | (overflow menu) | header "..." | — | Contents not visible `[VERIFY]` |

## 7. States

- **Default:** populated sample lead (Overview tab).
- **Empty:** n/a for a populated record; related lists may be individually empty
  `[VERIFY]`.
- **Loading:** not shown `[VERIFY]` (skeleton, no blank screen).
- **Error:** not shown `[VERIFY]`; 404 → DRF `{ detail }` for missing/forbidden.
- **Filtered:** n/a.

## 8. RBAC notes

- Owner is shown (mohamedalihussain.hm). Per best-practices, only the owner or
  role-shared users should retrieve/edit this record (`get_queryset()`).
  On-screen scope not confirmed `[VERIFY]`.
- Convert / Edit / Send Email may be role-gated `[VERIFY]`.

## 9. Validation behavior

n/a on the read view; edits go through the create/edit form (see
`sales-leads-create-new leads.notes.md`).

## 10. Performance notes

- Detail fetch: `select_related` for `owner`, `source`, `converted_deal`.
- Related lists: load lazily / `prefetch_related`; avoid fetching all related
  collections up front `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Reconcile the lead-status process values (Attempted to Contact,
      Contact in Future, Junk Lead, Lost Lead, …) with the ERD enum
      (`new/contacted/qualified/lost/converted`).
- [ ] [VERIFY] "Mobile" field — extend `Lead` model or drop?
- [ ] [VERIFY] Salutation ("Ms.") — add field or treat as display-only?
- [ ] [VERIFY] "Send Email" — is an email action in scope? No endpoint exists.
- [ ] [VERIFY] Header overflow "..." menu contents.
- [ ] [VERIFY] Which related lists are in scope (several are Zoho-native).
- [ ] [VERIFY] Tags ("+ Add Tags") — not in ERD.
- [ ] [VERIFY] Timeline tab contents and data source.
- [ ] [VERIFY] RBAC scope for view/edit/convert.
