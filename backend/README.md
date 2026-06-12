# Backend (Django + adrf)

## First-time setup

```bash
cd backend

# 1. Virtualenv
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install deps
pip install --upgrade pip
pip install -r requirements.txt

# 3. Env vars
cp .env.example .env
# edit .env: DATABASE_URL, SECRET_KEY, DEBUG, ALLOWED_HOSTS

# 4. Initialize the Django project (only once)
# If you'd prefer to scaffold manually:
django-admin startproject crm .

# 5. Database
mysql -u root -p -e "CREATE DATABASE crm CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
python manage.py migrate
python manage.py createsuperuser

# 6. Run
python manage.py runserver
```

## App layout

```
backend/
├── crm/              # Django project (settings, urls, wsgi, asgi)
├── apps/
│   ├── core/         # shared mixins (TimestampedModel), permissions, utils
│   ├── accounts/     # User, Role, Permission, JWT auth views
│   ├── companies/    # Account (B2B record)
│   ├── contacts/     # Person record
│   ├── leads/        # Lead → Deal conversion
│   ├── deals/        # Opportunities, Pipeline, Stage
│   └── activities/   # Tasks, Calls, Meetings
├── manage.py
├── pyproject.toml    # ruff config
├── requirements.txt
└── .env.example
```

## Commands

```bash
# Lint
ruff check .

# Format
ruff format .

# Test
pytest

# Open API schema
python manage.py spectacular --file schema.yml
```

## Conventions

- Each app has: `models.py`, `serializers.py`, `views.py`, `urls.py`,
  `filters.py`, `tests/`.
- Each app's `urls.py` is included in `crm/urls.py` under `/api/<app>/`.
- All views inherit from `adrf.viewsets.ViewSet` (or `ModelViewSet`).
