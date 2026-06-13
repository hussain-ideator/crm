# Campaigns — create campaign form — notes

> Source screenshot: `sales-campaigns-create campaigns.png`
> Module: Campaigns · Screen type: create/edit
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> ⚠️ **Not in our data model.** There is **no Campaign entity in `docs/erd.md`**
> and **no campaigns resource in `docs/api-contract.md`**. Every field below is
> a candidate for a *new* entity if Campaigns is taken into scope. **Scope +
> data-model decision needed before any spec** `[VERIFY]`.

## 1. Purpose

Create a marketing campaign and capture its budget/response metrics. Primary
actor: a marketing/sales user `[VERIFY]`.

## 2. Layout regions

- Left global nav (Campaigns selected; Activities + Inventory groups visible).
- Page header: **"Create Campaign"** + **"Edit Page Layout"** link; right:
  **Cancel**, **Save and New**, **Save**.
- Main: **"Campaign Information"** section, two-column form.
- Right edge: vertical **"Client Script"** tab (Zoho dev feature — out of scope
  `[VERIFY]`).

## 3. Components (in order)

1. Left global navigation sidebar.
2. Page header + "Edit Page Layout" link.
3. Cancel / Save and New / Save buttons.
4. "Campaign Information" section heading.
5. Two-column field grid.
6. "Client Script" side tab.

## 4. Default data shown

Empty form except **Campaign Owner** (prefilled current user). Fields visible
(left column, then right column):

Left: **Campaign Owner**, **Campaign Name** (required *), **Start Date**
(DD/MM/YYYY), **Expected Revenue** (Rs.), **Actual Cost** (Rs.), **Numbers
sent**, **Connected To** (= "Leads", with a lock icon).
Right: **Type** (`-None-`), **Status** (`-None-`), **End Date** (DD/MM/YYYY),
**Budgeted Cost** (Rs.), **Expected Response**.

- **No ERD mapping exists** — these would define a new `Campaign` model:
  owner (FK → User), name, type, status, start_date, end_date, expected_revenue,
  budgeted_cost, actual_cost, expected_response, numbers_sent, plus a relation
  implied by **"Connected To: Leads"** (Campaign ↔ Leads/Contacts) `[VERIFY]`.
- The ERD already references campaigns indirectly (a "Campaigns" related list
  appears on Lead/Contact/Account detail views) but defines **no** entity —
  reconcile `[VERIFY]`.

## 5. Filters / search / sort

n/a (form). Type / Status are option dropdowns; "Connected To" is a module
relation (Leads, locked) `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Save | "Save" | — (no `/api/campaigns/`) | Needs new resource `[VERIFY]` |
| Primary   | Save and New | "Save and New" | — | Then reset form |
| Secondary | Cancel | "Cancel" | back to list | |
| Secondary | Edit Page Layout | header link | layout config | Admin-only `[VERIFY]` |

## 7. States

- **Default:** empty form; Campaign Owner prefilled; Campaign Name required.
- **Empty:** n/a.
- **Loading:** save-in-progress not shown `[VERIFY]`.
- **Error:** field validation → DRF `{ field: [...] }`; mirror in zod
  `[VERIFY]`.
- **Filtered:** n/a.

## 8. RBAC notes

- Who may create campaigns not shown `[VERIFY]`. Owner defaults to current user.
- "Edit Page Layout" admin/config `[VERIFY]`.

## 9. Validation behavior

- **Required (red asterisk visible): Campaign Name.** Others appear optional
  `[VERIFY]`.
- Constraints: currency fields (Expected Revenue / Budgeted Cost / Actual Cost),
  numeric (Numbers sent / Expected Response), date format DD/MM/YYYY, Start ≤ End
  date `[VERIFY]`.
- Inline vs. submit-time timing not shown `[VERIFY]`.

## 10. Performance notes

- Lightweight create. "Connected To" relation lookups should be paginated
  `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] **Is Campaigns in scope?** Requires a new ERD entity + API
      resource (`/api/campaigns/`) — neither exists today.
- [ ] [VERIFY] Define the `Campaign` model + its relation to Leads/Contacts
      ("Connected To").
- [ ] [VERIFY] Type / Status option sets.
- [ ] [VERIFY] Required-field set beyond Campaign Name; currency/date rules.
- [ ] [VERIFY] Reconcile with the "Campaigns" related list shown on Lead/
      Contact/Account detail views.
