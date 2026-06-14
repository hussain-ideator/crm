# Features

Colocate by feature, not by type. Each CRM module lives in its own folder
under `src/features/<resource>/` and contains everything that feature needs:

```
features/leads/
├── components/   # feature-specific UI (not shared shadcn primitives)
├── hooks/        # useLeads, useCreateLead, …
├── queries.ts    # TanStack Query keys + query/mutation fns
├── schemas.ts    # zod schemas (single source of validation truth)
└── types.ts      # feature-local TS types
```

Rules:

- **No per-type global splits.** There is no top-level `components/`, `hooks/`,
  or `utils/` bucket that everything dumps into. Shared, app-wide UI primitives
  live in `src/components/` (shadcn lands in `src/components/ui/`); cross-cutting
  helpers live in `src/lib/`.
- Server state goes through TanStack Query only. Query keys follow
  `[resource, params]`, e.g. `['leads', { status: 'qualified' }]`.
- Forms use react-hook-form + zod; the zod schema mirrors backend validation.
- File names are `kebab-case.tsx`; components are `PascalCase` named exports.
