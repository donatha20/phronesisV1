# Firebase → Django / PostgreSQL / AWS — Migration Plan & Tracker

## Decisions (locked)

- Backend: **Django 5 + Django REST Framework**
- Hosting: **AWS** — RDS PostgreSQL (Multi-AZ), ECS Fargate + ALB, S3 + CloudFront, ElastiCache Redis, SQS (Celery broker), Secrets Manager, ECR, Route 53 + ACM
- Auth: email/password primary **+ "Login with Google"** option (django-allauth OIDC, scopes `openid email profile`). JWT via SimpleJWT (15 min access / 14 day rotating refresh). Web = httpOnly cookies; Android = EncryptedSharedPreferences
- Google Workspace data (Drive/Calendar/Meet): **separate** server-side OAuth broker, refresh token encrypted at rest. Not the login flow
- Repo: **monorepo** (`apps/web`, `apps/android`, `services/api`, `packages/shared-types`, `infra/`)
- Spiritual Assistant: **deferred** — endpoint stubbed behind `ASSISTANT_FEATURE_ENABLED=false`
- Prayer vault v1: **access control + audit logging only** (no app-layer encryption); password re-auth before revealing `PRIVATE_VAULT` entries

## Firebase dependency inventory

### Web (`apps/web`)
| Ref | Item | Purpose | Replacement |
|-----|------|---------|-------------|
| W1 | `firebase` npm pkg | pulls firebase/app + firebase/auth | remove; `apiClient` fetch wrapper to Django |
| W2 | `initializeApp` (googleAuth.ts) | Firebase app singleton from `firebase-applet-config.json` | delete |
| W3 | `onAuthStateChanged` | reactive "is signed in" | session cookie + `GET /api/auth/user/` + React `AuthProvider` |
| W4 | `signInWithPopup`+`GoogleAuthProvider` | broker a Google OAuth **access token** w/ 12 Workspace scopes | server-side OAuth broker; client never sees Google token |
| W5 | `signOut` | clear session | `POST /api/auth/logout/` |
| W6 | `User` type | callback typing | local `AuthUser` from our API |
| W7 | `firebase-applet-config.json` | apiKey/authDomain/... + `oAuthClientId` | delete; reuse `oAuthClientId` as `GOOGLE_WORKSPACE_CLIENT_ID` (backend); rotate `apiKey` |
| W8 | `signInWithGoogleDrive()` callers (GoogleCalendarMeetView, GoogleDriveView) | trigger sign-in, hold token, call googleapis | call `/api/integrations/google/*` + `/api/sessions/` |
| W9 | in-memory token cache | hold Google token | gone (server-side only) |
| W10 | googleDriveService.ts | browser→Drive v3; `Blob.text()` corrupts binary | backend `/api/resources/` → S3 + Postgres |
| W11 | googleCalendarService.ts | browser→Calendar v3; hardcodes tomorrow 19:00 | backend persists real `scheduled_at`, calls Calendar w/ stored token |
| W12 | googleMeetService.ts | browser→Meet v2 spaces | backend creates space on session create |
| W13 | `App.tsx` useState arrays from sampleData | all app state | Postgres tables + REST |
| W14 | SpiritualAssistantModal canned replies | fake AI | `/api/assistant/query/` (deferred, flagged off) |

### Android (`apps/android`)
| Ref | Item | Status | Action |
|-----|------|--------|--------|
| A1 | `google-services` Gradle plugin (root + app + `googleServices{}`) | no `google-services.json` present | remove from both build files + catalog |
| A2 | `platform(libs.firebase.bom)` | version BOM | remove |
| A3 | `libs.firebase.ai` | declared, **zero code refs** | remove |
| A4 | `libs.firebase.appcheck.recaptcha` + `.debug` | declared, no init/usage | remove; use bearer-token API auth + rate limiting (+ Play Integrity later) |
| A5 | `secrets { ignoreList += FIREBASE_APPCHECK_DEBUG_TOKEN }` | reserved name | drop the line |
| A6 | `firebase-firestore`, `firebase-auth` catalog entries | commented / unused | delete entries |
| A7 | Retrofit/OkHttp/Moshi/Room deps | declared, unused | **keep** — target data layer |

Android has **no functional Firebase code**, only build wiring.

### Cannot migrate 1:1
- `onAuthStateChanged` reactive push → cookie + `/user/` fetch + context (multi-tab sync needs `storage` event/polling)
- `signInWithPopup` popup UX → full-page redirect; client loses direct Google token access (by design; fixes scope/refresh/browser-token issues)
- Firebase App Check / reCAPTCHA attestation (Android, inert) → no drop-in; substitute JWT auth + rate limiting + optional Play Integrity / Turnstile
- `firebase-ai` Gemini → new backend feature, not a migration item (no data/behavior lost)
- Firestore realtime listeners → none in use; if needed later use SSE/WebSocket/polling
- Prayer vault "encryption" (`pin === '1234'`, labels) → real access control + audit + password re-auth

## Phase tracker

- [x] **P0** Monorepo restructure (web→apps/web, android→apps/android; added services/api, infra, packages, .github)
- [x] **P1** Django scaffold: settings split (base/dev/test/prod), DRF, allauth 65 + dj-rest-auth + SimpleJWT (httpOnly cookie JWT, rotating refresh + blacklist), drf-spectacular, Dockerfile, docker-compose, CI (ruff + migration-drift + pytest). Email-first custom `User` (UUID PK, role), `SecuritySettings`, append-only `AuditLog` + `record()` service + audited login/logout views, `EncryptedTextField`, health/ready probes. 4 smoke tests green, `makemigrations --check` clean, ruff clean.
- [x] **P2** Models + migrations for all domains + `seed_demo` (non-prod only). Apps: `mentorship` (application + pairing w/ partial-unique constraints), `goals` (Goal + Milestone), `devotions` (Devotion + Comment + like through-tables), `media` (PodcastEpisode + like/save), `sessions` (`DiscipleshipSession` w/ real `scheduled_at` + Meet/Calendar id fields), `prayers` (PrayerRequest + PrayerIntercession; privacy enum, no app-layer crypto), `resources` (Resource + Bookmark + Enrollment), `integrations` (`GoogleWorkspaceToken` w/ Fernet-encrypted refresh token). Shared `LifeSphere`/`UserRole` in `apps/common/choices.py`; profile fields folded onto `User`. Migrations apply clean, `seed_demo` works, ruff + pytest green.
- [x] **P3** Auth end-to-end. **Backend:** hand-rolled server-side Google OAuth authorization-code flow (`apps/accounts/google_oauth.py`) — `GET /api/auth/google/authorize/` (state in short-lived httpOnly cookie) → Google → `GET /api/auth/google/callback` verifies ID token + `email_verified`, upserts user, sets JWT cookies via `set_jwt_cookies`, redirects to `FRONTEND_URL/auth/callback`; all failures redirect to `FRONTEND_URL/login?error=<slug>` with a `LOGIN_FAILED` audit row. `GET /api/auth/csrf/` primes the csrftoken cookie; `REST_AUTH` now enforces CSRF on cookie-JWT (`X-CSRFTOKEN`). `ACCOUNT_EMAIL_VERIFICATION="none"` (email verification deferred). 6 new backend tests (10 total green). **Frontend (`apps/web`):** `lib/api.ts` (credentialed fetch, CSRF header, 401→refresh→retry), `auth/AuthContext.tsx` (`AuthProvider`/`useAuth`: login, register, logout, refresh, `loginWithGoogle` full-page redirect), `auth/AuthScreen.tsx` (login/register + "Continue with Google"), `auth/CallbackScreen.tsx`, `auth/adapt.ts` (API user → legacy `UserProfile` bridge until P4). `App.tsx` gated on auth; `Header.tsx` persona-switcher replaced with real user + Sign out. **Firebase removed from web:** `firebase` dep dropped, `firebase-applet-config.json` deleted, `services/googleAuth.ts` rewritten as a Workspace-connection shim (real broker in P5). `tsc` + `vite build` green.
- [~] **P4** Core CRUD endpoints + RBAC + audit logging (**P4a backend done**); port App.tsx state to an API-backed store (**P4b frontend pending**).
  - **P4a:** `AuditedModelViewSet` base, `apps/common/permissions.py` (role helpers, `ReadOnlyOrMentor`, owner checks), `config/api_router.py`. ViewSets: goals (+nested milestones, mentor-approval gating), devotions (+like / comment / comment-like actions — comments now persist), episodes (+like/save, view-count), sessions (real `scheduled_at`, pairing-checked create, cancel/complete), prayers (privacy-scoped queryset; PRIVATE_VAULT body masked until `POST /api/prayers/vault/unlock/` password re-auth, 10-min window; intercede/answer; `PRAYER_VIEW` / `VAULT_UNLOCK` / `VAULT_UNLOCK_FAILED` audits), resources (access-tier queryset, bookmark/enroll), mentorship (application → accept creates `Mentorship` + bumps `active_mentees_count`, one-active-mentor rule), `GET /api/mentors/` directory. 31 tests green (24 new), ruff clean, OpenAPI generates.
  - **P4b (core views) done:** `@tanstack/react-query` added; `src/api/{dto,enums,adapters,hooks}.ts` (typed DTOs, snake_case↔legacy-enum maps, DTO→legacy-type adapters, query/mutation hooks with cache invalidation). Wired **Goals, Devotions, Prayers, Sessions** (+ Dashboard's read side) onto the live API in `App.tsx`; Podcasts/Mentors/Resources/Security/Google Drive & Calendar views remain on sample data pending their own pass. View contract changes: `SpheresGoalsView` (`onToggleMilestone`/`onCreateGoal` replace whole-object callbacks), `PrayerVaultView` (real password re-auth via `vaultUnlocked`/async `onUnlockVault`, removed the "1234"/biometric/zero-knowledge language), `DiscipleshipSessionsView` (schedules with the real paired mentor via `useMyMentorship`, `datetime-local` picker replaces free-text time, dead Google-sync branch removed), `DailyDevotionsView` (comments fetched per-devotion via `useDevotionComments` and posted through the API — comments now persist for real; added a like button). Found and fixed a real bug along the way: dj-rest-auth's `RegisterView` never set the JWT cookies it advertises in its response body — added `AuditedRegisterView` to set them + audit `REGISTER` (backend tests still 31/31 green; verified live via `APIClient`). `tsc` + `vite build` green.
  - **Remaining for a later pass:** Podcasts/Mentors/Resources/Security/Google views onto the API, retire `auth/adapt.ts`, OpenAPI-generated `packages/shared-types` (hand-written DTOs stand in for now).
- [ ] **P5** Google Workspace broker + Celery; Drive/Calendar/Meet server-side; real `scheduled_at`
- [ ] **P6** S3 media/resources: real upload/download via presigned URLs
- [ ] **P7** Prayer vault v1: privacy querysets + password re-auth + audit trail
- [ ] **P8** Harden: throttling, Sentry, WAF, RDS backup/restore rehearsal, load test
- [ ] **P9** Infra: Terraform for AWS; staging + prod; GitHub Actions deploy w/ gated migrate
- [ ] **P10** Android: strip Firebase Gradle wiring; Retrofit + Room against OpenAPI; real login
- [ ] **P11** Cutover: deploy prod, smoke test, disable Firebase project, rotate keys

## Post-cutover cleanup
- Rotate/disable Firebase `apiKey` in `apps/web/firebase-applet-config.json`
- Delete Firebase project `ai-studio-applet-webapp-c57ff`
