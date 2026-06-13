# Accounts — detail view — notes

> Source screenshot: `slaes-accounts-detail-view.png`
> Module: Accounts (ERD `Company`) · Screen type: detail
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

> Note: the source filename has a typo ("slaes-" not "sales-"); this notes file
> mirrors it so the pair stays adjacent. Consider renaming both together
> `[VERIFY]`.

## 1. Purpose

View a single account (company) profile with its related deals and contacts,
and act (send email, edit). Primary actor: the account owner / a sales user
`[VERIFY]`.

## 2. Layout regions

- Left global nav (Accounts selected).
- Record header: name **"Truhlar And Truhlar (Sample)"**, website link,
  **"+ Add Tags"**; right: **Send Email**, **Edit**, overflow, prev/next;
  **"Last Update: 10:45 AM"**.
- Left "Related List" panel.
- Main: **Overview / Timeline** tabs + field block; below, **Deals** and
  **Contacts** summary cards.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Record header (name, website, Add Tags).
3. Action buttons: Send Email, Edit, overflow, prev/next.
4. "Related List" panel.
5. Overview / Timeline tabs.
6. Field detail block.
7. Related summaries: Deals, Contacts.

## 4. Default data shown

Fields visible (map to ERD `Company`):

- **Account Owner:** mohamedalihussain.hm → `owner`. ✓
- **Industry:** (shown, value blank/truncated) → `industry`. ✓
- **Employees:** 23 → `employee_count`. ✓
- **Annual Revenue:** Rs. 2,00,000.00 → `annual_revenue`. ✓ (INR)
- **Phone:** 555-555-5555 → `phone`. ✓
- Header website link → `website`. ✓
- `billing_address` / `shipping_address` (ERD) not shown here `[VERIFY]`.

Related summaries:
- **Deals:** "Truhlar And Truhlar Attys" Rs. 45,000.00 — Needs Analysis,
  13/06/2026 → `Deal` via `company_fk`. ✓
- **Contacts:** "Sage Wieser (Sample)" sage-wieser@noemail.invalid → `Contact`
  via `company_fk`. ✓

Related List panel entries (visible): **Notes, Connected Records, Attachments,
Deals, Contacts, Emails, Open Activities, Closed Activities, Products, Quotes,
Sales Orders, Invoices** (truncated).
- Map: Notes → `Note` ✓; Attachments → `Attachment` ✓; Deals/Contacts →
  reverse FKs ✓; Open/Closed Activities → `Activity` ✓.
- **Not in ERD:** Connected Records, Emails, Products, Quotes, Sales Orders,
  Invoices. Flag / decide scope `[VERIFY]`.

## 5. Filters / search / sort

n/a (single record). Overview vs. Timeline tabs `[VERIFY]`.

## 6. Actions

| Type      | Action | Trigger | Endpoint or route | Notes |
|-----------|--------|---------|-------------------|-------|
| Primary   | Send Email | "Send Email" | — | No email endpoint `[VERIFY]` |
| Secondary | Edit | "Edit" | `PATCH`/`PUT /api/companies/{id}/` | |
| Secondary | Add Tags | "+ Add Tags" | — | Tags not in ERD `[VERIFY]` |
| Secondary | Prev/Next | header arrows | sibling `{id}` | |
| Secondary | Jump to related list | left panel | nested fetch | |
| Hidden/overflow | overflow menu | "..." | — | Contents not visible `[VERIFY]` |

## 7. States

- **Default:** populated sample account (Overview).
- **Empty / Loading / Error:** not shown `[VERIFY]`; 404 → DRF `{ detail }`.
- **Filtered:** n/a.

## 8. RBAC notes

- Owner shown; object-level scope (own + role-shared) per best-practices
  `[VERIFY]`.

## 9. Validation behavior

n/a (read view; edits via the account form).

## 10. Performance notes

- Detail fetch: `select_related` `owner`.
- Related lists (Deals, Contacts, Activities, Notes) lazy / `prefetch_related`
  `[VERIFY]`.

## 11. Open questions

- [ ] [VERIFY] Billing/shipping address presence on this layout (not shown).
- [ ] [VERIFY] Which related lists are in scope (Quotes/Sales Orders/Invoices/
      Products not in ERD).
- [ ] [VERIFY] Send Email scope; Tags; overflow contents; RBAC scope.
- [ ] [VERIFY] Rename the source file to fix the "slaes-" typo.
