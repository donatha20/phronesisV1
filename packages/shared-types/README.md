# @phronesis/shared-types

TypeScript types generated from the Django API's OpenAPI schema.

```bash
# from repo root, with the API running or schema exported
cd services/api && python manage.py spectacular --file ../../packages/shared-types/openapi.yaml
cd ../../packages/shared-types && npx openapi-typescript openapi.yaml -o index.ts
```

`apps/web` imports from here so request/response shapes stay in lockstep with the backend.
Wired up in phase P4.
