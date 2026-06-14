# CRM Frontend

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui, TanStack
Query, TanStack Table, react-hook-form + zod. See
[`.agent-os/product/tech-stack.md`](../.agent-os/product/tech-stack.md) for the
canonical stack and [`.agent-os/standards/code-style.md`](../.agent-os/standards/code-style.md)
for conventions.

## Prerequisites

- **Node 20+** (Node 22.13+ recommended — some toolchain packages warn below it).
- npm (the repo uses npm; no pnpm/yarn lockfile).

## Setup

```bash
cd frontend
npm install
cp .env.example .env.local      # then edit NEXT_PUBLIC_API_BASE_URL if needed
```

`.env.local` (and any `.env*.local`) is gitignored; `.env.example` is the
committed template.

## Scripts

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `npm run dev`          | Start the dev server (Turbopack) at http://localhost:3000     |
| `npm run build`        | Production build                                              |
| `npm start`            | Serve the production build                                    |
| `npm run lint`         | ESLint (Next + typescript-eslint strict, Prettier-compatible) |
| `npm run lint:fix`     | ESLint with `--fix`                                           |
| `npm run format`       | Prettier write                                                |
| `npm run format:check` | Prettier check (CI-safe)                                      |
| `npm test`             | Vitest (unit/component, jsdom)                                |
| `npm test -- --run`    | Vitest single run, non-watch                                  |
| `npm run test:ui`      | Vitest UI                                                     |
| `npm run test:e2e`     | Playwright e2e (boots `npm run dev` automatically)            |

> Playwright browsers install on first use: `npx playwright install`.

## Project structure

```
src/
├── app/                # App Router routes (layout wrapped with QueryProvider)
├── components/         # shared UI; shadcn primitives live in components/ui/
├── features/           # colocate by feature: components, hooks, queries, schemas, types
├── lib/
│   ├── api.ts          # the only place raw fetch lives
│   ├── query-client.ts # QueryClient factory + browser singleton
│   └── utils.ts        # cn() + shared helpers
├── providers/          # QueryProvider (client) and future app providers
└── types/              # cross-feature shared types
tests/
├── setup.ts            # Vitest + Testing Library setup
└── e2e/                # Playwright specs (created as features land)
```

Conventions: App Router only (no `pages/`). Colocate by feature, not by type.
Files are `kebab-case.tsx`; components are `PascalCase` named exports; default
exports only for Next pages/layouts. Server state via TanStack Query only —
no `fetch` in components. Forms via react-hook-form + zod.

## UI components (shadcn/ui)

shadcn/ui is **copy-paste, owned in this repo** — components are committed
source you can edit, not a versioned dependency. Config lives in
`components.json` (style `new-york`, base color `neutral`, CSS variables).

Add components on demand and commit them:

```bash
npx shadcn add button input form table dialog
```

They land in `src/components/ui/`.
