# CRM (Zoho CRM clone)

A self-hosted CRM built with Django + adrf (async DRF), MySQL, and Next.js.
Developed using **Agent OS** standards and **SpecKit** spec-driven workflow.

## Stack

- **Backend:** Django 5.x, adrf, MySQL 8, JWT auth (simplejwt), drf-spectacular
- **Frontend:** Next.js 15 (App Router), TypeScript, shadcn/ui, Tailwind, TanStack Query, TanStack Table
- **Tooling:** Agent OS, SpecKit, Claude Code, GitHub Actions

## Repository layout

```
.
├── .agent-os/        Agent OS context (product, standards, specs)
├── .specify/         SpecKit configuration
├── .claude/          Claude Code commands and settings
├── backend/          Django project + apps
├── frontend/         Next.js app
├── docs/             ERD, API contract, wireframes
└── .github/          PR template, issue templates, CI
```

## Quick start

Full setup steps are in [`docs/setup.md`](docs/setup.md).

```bash
# 1. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env       # then edit DB credentials
python manage.py migrate
python manage.py runserver

# 2. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Development workflow

Every feature follows the SpecKit loop:

1. `/speckit.specify` — describe the feature
2. `/speckit.clarify` — answer clarifying questions
3. `/speckit.plan` — generate technical plan
4. `/speckit.tasks` — break into ordered tasks
5. `/speckit.implement` — execute with Claude Code

Specs land in `.agent-os/specs/YYYY-MM-DD-<JIRA-ID>-<slug>/`.

## Standards

See [`.agent-os/standards/`](.agent-os/standards/) for code style and best practices.
See [`.agent-os/product/`](.agent-os/product/) for mission, roadmap, and stack decisions.
