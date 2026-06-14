# Local setup

End-to-end first-time setup. Allow ~30 minutes.

## Prerequisites

- Python 3.12+
- Node.js 20+ and npm
- MySQL 8.x running locally
- Git
- (Optional) `uv` for SpecKit, Docker for optional services

## 1. Clone

```bash
git clone git@github.com:hussain-ideator/crm.git
cd crm
```

## 2. Database

```bash
mysql -u root -p <<'SQL'
CREATE DATABASE crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm'@'localhost' IDENTIFIED BY 'crmpass';
GRANT ALL PRIVILEGES ON crm.* TO 'crm'@'localhost';
FLUSH PRIVILEGES;
SQL
```

## 3. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

cp .env.example .env
# edit .env if your DB credentials differ

# If the Django project hasn't been scaffolded yet:
django-admin startproject crm .

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# → http://localhost:8000
```

## 4. Frontend

```bash
cd ../frontend

# First time only: scaffold Next.js into this folder
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"

# shadcn
npx shadcn@latest init

# runtime deps
npm install @tanstack/react-query @tanstack/react-table zustand \
  react-hook-form @hookform/resolvers zod lucide-react

cp .env.example .env.local
npm run dev
# → http://localhost:3000
```

## 5. Agent OS

Follow https://github.com/buildermethods/agent-os for the install command
(it's a curl-to-shell installer that places files in `agent-os/`).
The `product/` and `standards/` folders in this repo are already seeded.

## 6. SpecKit

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
specify init --here --ai claude
```

That gives you `/speckit.specify`, `/speckit.plan`, `/speckit.tasks`,
`/speckit.implement` inside Claude Code.

## 7. Claude Code

```bash
# In the repo root
claude
```

Then try:
```
/speckit.specify Implement the Leads module with create, list, detail, and edit.
```

## 8. Verify

- Backend: `curl http://localhost:8000/api/schema/` returns YAML
- Frontend: `http://localhost:3000` renders the Next.js welcome page
- Login: visit `/login`, sign in with the superuser you created
