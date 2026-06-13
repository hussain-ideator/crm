# <Screen name> — notes

> Source screenshot: `<filename>.png`
> Module: <Leads | Deals | …> · Screen type: <list | detail | create/edit | chart | menu/overlay>
> Status: draft · Last updated: <YYYY-MM-DD>

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec. Delete sections that genuinely don't
apply (and note why), rather than leaving them blank.

## 1. Purpose

What is the user trying to accomplish on this screen? One or two sentences.
Who is the primary actor (role)?

## 2. Layout regions

Top-to-bottom / left-to-right breakdown of the screen's structural zones.

- Header / toolbar: …
- Sidebar / nav: …
- Main content: …
- Footer / pagination: …

## 3. Components (in order)

Numbered list of UI components as they appear, in reading order. Note the type
(table, form, card, dropdown, chart, modal, …).

1. …
2. …

## 4. Default data shown

What data is visible on load, before any user interaction.

- Columns / fields displayed: … (map each to an ERD field where possible;
  flag screen-only or derived values with `[VERIFY]`)
- Default sort / grouping: … `[VERIFY]`
- Default page size: 25 (per best-practices) `[VERIFY]`

## 5. Filters / search / sort

- Filters available: … (map to `?<field>=` / `?<field>__in=` params)
- Search (`q`): scope = name + email + phone per API contract `[VERIFY]`
- Sortable columns (`ordering`): …
- URL reflects filter/search/sort state (frontend invariant).

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   |        |                    |                   |       |
| Secondary |        |                    |                   |       |
| Row       |        |                    |                   |       |
| Bulk      |        |                    |                   |       |
| Hidden / overflow |  |                  |                   |       |

## 7. States

- **Default:** …
- **Empty:** (no records / first-run) …
- **Loading:** (skeleton / spinner — no blank screens) …
- **Error:** (DRF `{ detail }` or field errors `{ field: [...] }`) …
- **Filtered (no results):** distinct from empty — keep filters visible …

## 8. RBAC notes

- Who sees this screen / these records? (object-level: own + role-shared,
  enforced in `get_queryset()`)
- Role-gated actions or fields (Admin / Manager / Sales Rep): … `[VERIFY]`

## 9. Validation behavior

(For create/edit screens; otherwise note "n/a".)

- Required fields: … (mirror in zod + serializer)
- Format / constraint rules: … (email, phone, max_length) `[VERIFY]`
- Inline vs. submit-time validation: … `[VERIFY]`

## 10. Performance notes

- List joins: `select_related` for FKs (owner, source), `prefetch_related`
  for m2m/reverse. Watch N+1.
- Indexed columns for any filter/sort surfaced here: … `[VERIFY]`
- Pagination: default 25, max 100.

## 11. Open questions

- [ ] …
- [ ] …
