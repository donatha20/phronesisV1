# Phronesis API (Django + DRF)

## Setup

```bash
py -3 -m venv .venv
.venv\Scripts\activate              # Windows  (source .venv/bin/activate elsewhere)
pip install -r requirements-dev.txt
copy .env.example .env              # then edit
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"  # -> FIELD_ENCRYPTION_KEY

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Needs PostgreSQL + Redis — easiest via `docker compose up db redis` from the repo root.

## Layout

```
config/           settings split (base/dev/test/prod), urls, celery, asgi/wsgi
apps/common/      UUID + timestamp model bases, EncryptedTextField, health checks
apps/accounts/    custom email-first User, roles, SecuritySettings, Google login view
apps/audit/       append-only AuditLog + record() service + auth signal hooks
```

## Auth

| Endpoint | Purpose |
|----------|---------|
| `POST /api/auth/registration/` | email/password sign-up |
| `POST /api/auth/login/` | email/password login -> sets `phronesis-access` / `phronesis-refresh` httpOnly cookies |
| `POST /api/auth/logout/` | clears cookies, blacklists refresh |
| `POST /api/auth/token/refresh/` | rotate access token |
| `GET  /api/auth/user/` | current user |
| `POST /api/auth/google/` | "Login with Google" (OIDC, identity only) |

Google Workspace data access (Drive/Calendar/Meet) is a **separate** flow added in P5 under
`/api/integrations/google/` and does not run through the login endpoints.

## Schema / docs

`GET /api/schema/` (OpenAPI) · `GET /api/docs/` (Swagger UI)

## Tests

```bash
pytest
ruff check .
python manage.py makemigrations --check --dry-run
```
