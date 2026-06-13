# Leads — chart view — notes

> Source screenshot: `sales-leads-chart-view.png`
> Module: Leads · Screen type: chart (alternate view of the list)
> Status: draft · Last updated: 2026-06-13

Use `[VERIFY]` to mark anything inferred from the screenshot that needs human
confirmation before it drives a spec.

## 1. Purpose

View leads as an aggregate chart (a count grouped by a chosen field) as an
alternate "view" of the same list data. Primary actor: a sales user / manager
reviewing distribution `[VERIFY]`.

## 2. Layout regions

- Left global nav.
- Top bar: "Leads" title + global Search records.
- Sub-toolbar: **All Leads** selector, Filter, Sort, view-toggle icons (chart
  view active), refresh; **Create Lead** + overflow "...".
- Chart configuration row: **Group By**, **Measure**, an add ("+") control, a
  chart-type selector, and two more dropdowns.
- Main content: a **bar chart**.
- Footer: **Total Records 10**.

## 3. Components (in order)

1. Left global navigation sidebar.
2. Top bar + global search.
3. View toolbar (chart view active) + Create Lead/overflow.
4. Chart configuration row (Group By / Measure / chart type / etc.).
5. Bar chart.
6. "Total Records" footer.

## 4. Default data shown

- **Group By:** Created Time (label truncated "Crea…") → ERD `Lead.created_at`. ✓
- **Measure:** Count → `COUNT(*)`.
- Chart: a single bar at **12/06/2026** with **Record Count = 10**.
- Footer: **Total Records 10** (matches the sample dataset).
- Available Group By dimensions and Measures beyond the current selection are
  not shown `[VERIFY]`.

## 5. Filters / search / sort

- **Filter** and **Sort** controls are present in the toolbar; whether the chart
  honors the active list filter is not confirmed `[VERIFY]`.
- The chart's own controls are **Group By** (dimension) and **Measure**
  (aggregate); these are chart configuration, not list query params.

## 6. Actions

| Type      | Action | Trigger / location | Endpoint or route | Notes |
|-----------|--------|--------------------|-------------------|-------|
| Primary   | Create Lead | toolbar button | `POST /api/leads/` | |
| Primary   | (overflow "...") | beside Create Lead | — | Bulk/mass actions — see `sales-leads-more-info-threedots.notes.md` |
| Secondary | Change Group By | config row | aggregation query `[VERIFY]` | |
| Secondary | Change Measure | config row | aggregation query `[VERIFY]` | |
| Secondary | Change chart type | config row selector | client render | `[VERIFY]` |
| Secondary | Switch to list view | toolbar view toggle | route change | |
| Secondary | Filter / Sort / Refresh | toolbar | `[VERIFY]` | |

## 7. States

- **Default:** single-bar chart over 10 records.
- **Empty:** no records → empty chart / zero-state not shown `[VERIFY]`.
- **Loading:** not shown `[VERIFY]`.
- **Error:** not shown `[VERIFY]`.
- **Filtered:** chart presumably reflects the active filter `[VERIFY]`.

## 8. RBAC notes

- Chart should aggregate only over records the user may see (own + role-shared,
  `get_queryset()`); on-screen scope not confirmed `[VERIFY]`.

## 9. Validation behavior

n/a (read-only aggregation view).

## 10. Performance notes

- Aggregation should be a DB-side `GROUP BY` / `COUNT`, **not** client-side over
  fetched rows `[VERIFY]`. No aggregation endpoint exists in the API contract —
  needs design.
- Index the group-by column (`created_at` here, and any other offered
  dimensions) per best-practices.

## 11. Open questions

- [ ] [VERIFY] Which Group By dimensions and Measures are available?
- [ ] [VERIFY] Does the chart honor the list's active filter / search?
- [ ] [VERIFY] Is chart configuration persisted per user / per view?
- [ ] [VERIFY] Aggregation endpoint design (none in the API contract).
- [ ] [VERIFY] Empty / loading / error states for the chart.
