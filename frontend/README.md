# Frontend (Next.js 15 + shadcn/ui)

## First-time setup

```bash
cd frontend

# 1. Initialize Next.js (only once)
# Run from this directory; it will fill in the current folder.
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --eslint \
  --src-dir \
  --import-alias "@/*"

# 2. Install shadcn/ui
npx shadcn@latest init
# pick: TypeScript, Tailwind, default style, slate base color,
# CSS variables = yes, src directory = yes, app router = yes

# 3. Add base components as you need them
npx shadcn@latest add button input form table dialog dropdown-menu \
  select toast card avatar badge

# 4. Install runtime deps
npm install @tanstack/react-query @tanstack/react-table zustand \
  react-hook-form @hookform/resolvers zod lucide-react

# 5. Env
cp .env.example .env.local
# edit NEXT_PUBLIC_API_URL

# 6. Run
npm run dev
```

## Conventions

- App Router only. No `pages/` directory.
- Feature folders under `src/features/<resource>/` containing components,
  hooks, queries, types, schema.
- API client in `src/lib/api/` — thin fetch wrapper that injects the JWT
  access token and handles 401 → refresh.
- Server Components for list pages (faster initial paint). Client Components
  for interactive forms and tables.

## Suggested folder layout (after create-next-app)

```
frontend/src/
├── app/                  # routes
│   ├── (auth)/           # login, register, forgot-password
│   ├── (dashboard)/      # protected app shell
│   │   ├── leads/
│   │   ├── contacts/
│   │   ├── companies/
│   │   ├── deals/
│   │   └── activities/
│   └── api/              # only for things that must run on the Next server
├── components/
│   └── ui/               # shadcn components
├── features/
│   ├── leads/
│   ├── contacts/
│   └── ...               # one folder per CRM module
├── lib/
│   ├── api/              # fetch client, query keys, mutations
│   ├── auth/             # JWT storage, refresh
│   └── utils.ts
└── styles/
```
