# Phronesis Mentorship — Monorepo

Cross-generational Christian mentorship platform. Migrated off Google AI Studio / Firebase
to a conventional Django + PostgreSQL backend deployed on AWS.

## Layout

| Path | What |
|------|------|
| `apps/web/` | React + Vite web client (primary) |
| `apps/android/` | Jetpack Compose Android client |
| `services/api/` | Django + DRF backend (auth, data, Google Workspace broker) |
| `packages/shared-types/` | TypeScript types generated from the API's OpenAPI schema |
| `infra/` | Terraform for AWS (VPC, RDS, ECS, S3, CloudFront, ElastiCache, SQS) |

## Local development

```bash
# Backend
cd services/api
py -3 -m venv .venv && .venv\Scripts\activate     # Windows
pip install -r requirements.txt -r requirements-dev.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver

# Web
cd apps/web
npm install
copy .env.example .env
npm run dev
```

`docker compose up` brings up Postgres + Redis + the API for a closer-to-prod loop.

## Migration status

See `MIGRATION_PLAN.md` for the Firebase→Django/AWS migration plan and phase tracking.
