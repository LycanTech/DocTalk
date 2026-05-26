# DocTalk

> Nigeria's offline-first medical records platform for doctors — across all specialties, anywhere in the country.

DocTalk allows licensed Nigerian doctors to access, create, and sync patient records regardless of internet connectivity. Built as an enterprise-grade PWA + mobile app with Apple HIG-inspired dark/light UI.

---

## Architecture Overview

```text
DocTalkApp/                         ← Turborepo monorepo
├── apps/
│   ├── web/                        ← Next.js 14 PWA (offline-capable)
│   ├── mobile/                     ← Expo 51 (iOS + Android)
│   └── api/                        ← Express.js REST API + Prisma ORM
├── packages/
│   ├── shared/                     ← Shared TypeScript types & utilities
│   └── ui/                         ← Apple HIG design tokens (colors, spacing, type)
└── infrastructure/
    └── docker/                     ← Docker Compose for dev / staging / prod
```

**Stack:**

| Layer          | Technology                                           |
| -------------- | ---------------------------------------------------- |
| Web frontend   | Next.js 14 (App Router) + Tailwind CSS + PWA         |
| Mobile         | Expo 51 (React Native) — iOS & Android               |
| Offline sync   | PouchDB + IndexedDB (web), SQLite via Expo (mobile)  |
| API            | Express.js 4 + TypeScript + Zod validation           |
| ORM            | Prisma 5 + PostgreSQL 16                             |
| Auth           | JWT (access + refresh token rotation) + bcrypt       |
| Monorepo       | Turborepo + pnpm workspaces                          |
| Containers     | Docker + Docker Compose + Traefik reverse proxy      |
| CI/CD          | GitHub Actions                                       |
| Design system  | Apple HIG – SF Pro fonts, system colors, 4px grid    |

---

## Environments

| Environment      | Branch        | URL                       | Trigger                       |
| ---------------- | ------------- | ------------------------- | ----------------------------- |
| **Development**  | `develop`     | `dev.doctalk.ng`          | Push to `develop`             |
| **Staging**      | `staging`     | `staging.doctalk.ng`      | Push to `staging`             |
| **Production**   | tag `v*.*.*`  | `doctalk.ng`              | Semver tag or manual dispatch |

### GitHub Environments & Required Secrets

Create three **GitHub Environments**: `development`, `staging`, `production`.
The `production` environment requires **manual reviewer approval** before the deploy job runs.

**All environments:**

- `ACME_EMAIL` — Let's Encrypt email for TLS certs
- `NEXT_PUBLIC_API_URL` — Public API base URL
- `CORS_ORIGINS` — Comma-separated allowed origins

**Development & Staging:**

- `{ENV}_HOST` — Server IP / hostname
- `{ENV}_USER` — SSH user
- `{ENV}_SSH_KEY` — Private SSH key
- `{ENV}_POSTGRES_PASSWORD`
- `{ENV}_JWT_SECRET`
- `{ENV}_JWT_REFRESH_SECRET`
- `{ENV}_API_URL`

**Production:**

- `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`
- `PROD_DATABASE_URL` — Full PostgreSQL connection string (managed DB recommended)
- `PROD_JWT_SECRET`, `PROD_JWT_REFRESH_SECRET`

---

## Quick Setup: VAPID Keys & Email

Before running the app, generate push notification keys and configure email:

```bash
# Generate VAPID keys (one-time, copy into .env)
npx web-push generate-vapid-keys

# For local email testing, start Mailhog via Docker
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
# SMTP settings: host=localhost port=1025, then view mail at http://localhost:8025
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm ≥ 9 (`npm i -g pnpm`)
- Docker Desktop
- (Mobile) Expo Go app or simulator

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Start the database

```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres couchdb -d
```

### 4. Run migrations & seed

```bash
pnpm db:migrate
pnpm --filter @doctalk/api run db:seed
```

Seed creates a demo doctor account:
`dr.adeyemi@doctalk.ng` / `DocTalk@2024!`

### 5. Start all apps

```bash
pnpm dev
```

| Service        | URL                                       |
| -------------- | ----------------------------------------- |
| Web app        | <http://localhost:3000>                   |
| API            | <http://localhost:4000>                   |
| API health     | <http://localhost:4000/health>            |
| Prisma Studio  | `pnpm db:studio`                          |

---

## CI/CD Pipeline

```text
PR → CI (lint + type-check + build + test + docker build)
         ↓
push develop → CD Dev   (auto-deploy → smoke test)
         ↓
push staging → CD Staging (auto-deploy → smoke test + tag approved)
         ↓
tag v*.*.* → CD Prod (approval gate → blue-green deploy → health check → auto-rollback)
```

### Pipeline Jobs

**CI (`ci.yml`)**

1. `quality` — TypeScript type-check + ESLint across all packages
2. `build` — Turborepo full build with artifact caching
3. `test` — Vitest + real PostgreSQL via service container
4. `docker` — Multi-arch Docker build + push to GHCR (on push only)

**CD Dev / Staging (`cd-dev.yml`, `cd-staging.yml`)**

- Waits for CI to pass
- Builds environment-specific Docker images
- SSH deploy + `docker compose up`
- Smoke tests against public URLs

**CD Prod (`cd-prod.yml`)**

- Triggered by semver tag (`v*.*.*`) or manual `workflow_dispatch`
- GitHub Environment approval gate (required reviewers)
- Blue-green style deploy: pull new images before stopping old
- Multi-attempt health checks
- Automatic rollback to `:latest` on failure
- Creates GitHub Release on success

---

## Offline Mode

DocTalk is built offline-first:

- **Web:** Next.js PWA via `next-pwa` — service worker caches app shell and API responses. PouchDB stores patient/record mutations in IndexedDB with `pending` status. Auto-sync fires when the browser comes back online.
- **Mobile:** Expo SQLite stores records locally. Delta sync pulls changes since last sync timestamp from `/api/v1/sync/delta`.
- **API:** `/api/v1/sync/push` accepts batches of offline-created records (upsert semantics). `/api/v1/sync/delta?since=<ISO>` returns changed records.

---

## Data Model

```text
Doctor ──< MedicalRecord >── Patient
Doctor ──< Appointment   >── Patient
```

Key patient fields: blood group, genotype (AA/AS/SS/AC/SC), allergies, chronic conditions, NHIS number, emergency contact.

Medical records include: vital signs, chief complaint, examination findings, diagnosis, prescriptions, lab results, and file attachments.

---

## Design System

The UI follows Apple Human Interface Guidelines:

- **Typography:** System font stack (`-apple-system`, SF Pro, Segoe UI, Roboto)
- **Colors:** Apple system palette — blue `#007AFF` / `#0A84FF` (dark), medical mint `#00C7BE`
- **Backgrounds:** True-black dark mode (`#000000` primary, `#1C1C1E` grouped)
- **Radius:** 6/10/14/20px scale matching iOS controls and cards
- **Animations:** `fade-in` (200ms ease-out), `slide-up` (300ms cubic-bezier)
- **Tailwind classes:** `card`, `btn-primary`, `btn-secondary`, `input`, `list-group`, `badge-*`

---

## Project Status

| Feature                           | Status        |
| --------------------------------- | ------------- |
| Auth (register / login / refresh) | ✅ Complete   |
| Patient CRUD + search             | ✅ Complete   |
| Medical records CRUD              | ✅ Complete   |
| Appointments management           | ✅ Complete   |
| Offline sync (web PWA)            | ✅ Complete   |
| Apple HIG dark/light UI           | ✅ Complete   |
| Next.js web app                   | ✅ Complete   |
| Expo mobile (iOS/Android)         | ✅ Scaffolded |
| GitHub Actions CI/CD              | ✅ Complete   |
| Docker dev/staging/prod           | ✅ Complete   |
| Doctor verification flow          | ✅ Complete   |
| Push notifications                | ✅ Complete   |
| File attachment upload            | ✅ Complete   |
| Telemedicine video                | Planned       |

---

## License

Proprietary — DocTalk Nigeria. All rights reserved.
