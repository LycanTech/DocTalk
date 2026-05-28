# DocTalk

> Nigeria's offline-first medical records platform for doctors — across all specialties, anywhere in the country.

DocTalk allows licensed Nigerian doctors to access, create, and sync patient records regardless of internet connectivity. Built as an enterprise-grade PWA + mobile app with an editorial dark UI, microservices backend, healthcare-grade PII protection, AI-powered clinical assistant, and a patient messaging portal.

---

## Microservices Architecture

```text
                      ┌──────────────────────────────────────────────────┐
  Browser / Mobile    │                  API Gateway :4000                │
  ─────────────────►  │  • JWT validation (all routes)                    │
                      │  • Role-based PII masking (NURSE sees masked data) │
                      │  • Audit log on every data-access event            │
                      └───────┬───────┬────────┬──────────┬───────────────┘
                              │       │        │          │
               ┌──────────────┘  ┌────┘   ┌───┘    ┌─────┘
               ▼                 ▼        ▼         ▼
        auth-svc :4011   patients :4012  records  appointments  notifications
        Login / tokens   CRUD patients  :4013     :4014         :4015
        Refresh rotation Raw data*      CRUD      Scheduling    WebPush VAPID

                      * Gateway masks PII before returning to client

                        ┌────────────────────────────────┐
                        │       Shared Data Layer         │
                        │  PostgreSQL :5432  CouchDB :5984│
                        └────────────────────────────────┘
```

### Port Map

| Service                  | Port | Purpose                             |
| ------------------------ | ---- | ----------------------------------- |
| `web` (Next.js PWA)      | 3002 | Frontend — doctors use this         |
| `api` (monolith)         | 4001 | Legacy monolith (still available)   |
| `api-gateway`            | 4000 | Microservices entry point (Docker)  |
| `service-auth`           | 4011 | Authentication & token management   |
| `service-patients`       | 4012 | Patient CRUD (raw, gateway masks)   |
| `service-records`        | 4013 | Medical records CRUD                |
| `service-appointments`   | 4014 | Appointment scheduling              |
| `service-notifications`  | 4015 | WebPush push notifications          |
| PostgreSQL               | 5432 | Primary relational store            |
| CouchDB                  | 5984 | Offline sync document store         |

---

## PII Protection

DocTalk protects patient personally identifiable information (PII) using role-based masking applied **at the API Gateway**, before any data reaches the client.

### Role Rules

| Role     | Data Access                      |
| -------- | -------------------------------- |
| `ADMIN`  | Full unrestricted access         |
| `DOCTOR` | Full access (clinical need)      |
| `NURSE`  | Masked PII (see patient, can't identify) |

### Fields Masked for NURSE Role

| Field              | Raw                              | Masked                    |
| ------------------ | -------------------------------- | ------------------------- |
| Phone              | `+2348012345001`                 | `+234*****5001`           |
| NHIS Number        | `NHIS-LG-2024-001`               | `NHIS-***-2024`           |
| Email              | `adaeze.okonkwo@gmail.com`       | `ad***@gmail.com`         |
| Address            | `14 Adeola Odeku St, V/Island`   | `14 Adeola Odeku***`      |
| Date of Birth      | `1985-03-15`                     | `1985-**-**`              |

### Implementation

Masking functions live in [`packages/shared/src/pii.ts`](packages/shared/src/pii.ts) — a shared TypeScript package imported by the gateway.

```typescript
// Nurse sees this:
maskPhone("+2348012345001")     // → "+234*****5001"
maskNhis("NHIS-LG-2024-001")   // → "NHIS-***-2024"
maskEmail("a.o@gmail.com")     // → "a.***@gmail.com"
maskDateOfBirth("1985-03-15")  // → "1985-**-**"

// Applied at the gateway layer:
const masked = maskPatientList(rawPatients, { role: doctor.role });
```

The gateway applies masking **after** the patients service returns raw data and **before** the HTTP response is sent. The patient service itself never knows what role is requesting — the gateway is the single enforcement point.

### Audit Logging

Every data-access event is written to the `audit_logs` table regardless of role:

```typescript
// Example audit log entry
{
  actorId:    "cuid-of-doctor",
  actorEmail: "dr.adeyemi@doctalk.ng",
  actorRole:  "NURSE",
  action:     "PII:LIST_PATIENTS",
  resource:   "patient",
  resourceId: null,
  ipAddress:  "102.88.12.45",
  metadata:   { role: "NURSE", piiMasked: true, count: 10 }
}
```

Audit action constants: [`packages/shared/src/pii.ts`](packages/shared/src/pii.ts) → `AUDIT_ACTIONS`.

---

## Monorepo Structure

```text
DocTalkApp/
├── apps/
│   ├── web/                   Next.js 14 PWA (offline-capable, port 3002)
│   ├── mobile/                Expo 51 React Native (iOS + Android)
│   ├── api/                   Monolith Express API + Prisma (port 4001)
│   ├── gateway/               API Gateway — JWT, PII masking, audit (port 4000)
│   └── services/
│       ├── auth/              Auth service (port 4011)
│       ├── patients/          Patients service (port 4012)
│       ├── records/           Records service (port 4013)
│       ├── appointments/      Appointments service (port 4014)
│       └── notifications/     Notifications service (port 4015)
├── packages/
│   ├── shared/                Types, utilities, PII masking, audit constants
│   └── ui/                    Design tokens
└── infrastructure/
    └── docker/
        ├── docker-compose.yml         Dev — all services + gateway
        ├── docker-compose.staging.yml Staging
        └── docker-compose.prod.yml    Production
```

---

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- pnpm 9+  (`npm install -g pnpm`)
- Docker Desktop (for PostgreSQL + CouchDB)

### 1. Start Infrastructure

```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres couchdb -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment

Copy the root `.env` to `apps/api/`:

```bash
cp .env apps/api/.env
```

Minimum `.env` contents:

```env
DATABASE_URL=postgresql://doctalk:doctalk@localhost:5432/doctalk_dev
JWT_SECRET=dev-jwt-secret-change-me
JWT_REFRESH_SECRET=dev-refresh-secret-change-me
PORT=4001
CORS_ORIGINS=http://localhost:3002
NEXT_PUBLIC_API_URL=http://localhost:4001
VAPID_PUBLIC_KEY=<your-vapid-public-key>
VAPID_PRIVATE_KEY=<your-vapid-private-key>
```

Generate VAPID keys: `npx web-push generate-vapid-keys`

### 4. Run Migrations & Seed

```bash
cd apps/api
pnpm exec prisma migrate dev --name init
pnpm run db:seed
```

The seed creates:

- **3 doctors**: `dr.adeyemi@doctalk.ng` / `DocTalk@2024!` · `chikwex@doctalk.ng` / `Chikwex@2024!` (ADMIN) · `dr.okafor@doctalk.ng` / `DocTalk@2024!`
- **10 Nigerian patients** with realistic clinical data (hypertension, sickle cell, HIV ART, malaria, etc.)
- **12 medical records** with vitals, prescriptions, diagnoses
- **16 appointments** across today, upcoming, and past dates

### 5. Start the App

```bash
# From repo root — starts web (3002) + api (4001) via Turbo
pnpm dev
```

Or start individually:

```bash
# API (monolith)
cd apps/api && pnpm dev

# Web
cd apps/web && pnpm dev

# Gateway (microservices entry point)
cd apps/gateway && pnpm run db:generate && pnpm dev

# Individual services
cd apps/services/auth         && pnpm run db:generate && pnpm dev  # :4011
cd apps/services/patients     && pnpm run db:generate && pnpm dev  # :4012
cd apps/services/records      && pnpm run db:generate && pnpm dev  # :4013
cd apps/services/appointments && pnpm run db:generate && pnpm dev  # :4014
cd apps/services/notifications&& pnpm run db:generate && pnpm dev  # :4015
```

### 6. Full Microservices Stack (Docker)

```bash
docker compose -f infrastructure/docker/docker-compose.yml up --build
```

---

## AI Clinical Assistant

DocTalk AI is a Claude-powered chat assistant embedded in the doctor dashboard (`/chat`).

### Capabilities

- Answers clinical questions using Nigerian formulary and WHO/NICE guidelines
- Context-aware: load any patient to give the AI their diagnosis history, allergies, vitals, and current medications
- Streaming responses — answers appear word-by-word in real time
- Session history — conversations are persisted per doctor in `chat_messages` table
- Suggests drug interactions, differential diagnoses, NHIS documentation guidance

### API Key Setup

Add your Anthropic API key to `.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com). The chat route uses `claude-haiku-4-5` for fast responses.

---

## Patient Portal

Public-facing page at `/patient-portal` — no login required.

- AI chat assistant for common health questions (rule-based + intent detection)
- **Message a Doctor** form — patients send inquiries directly to a specific doctor
- Doctor receives messages in the `/inbox` tab of the dashboard
- Doctor can reply directly from the inbox; replies are timestamped
- FAQ accordion for common DocTalk questions

---

## Doctor Verification System

Two-step verification for all doctor registrations:

| Step | Mechanism | Status |
| --- | --- | --- |
| 1. Email verification | Token link sent on registration | Implemented |
| 2. MDCN license review | Admin approves via `/admin/verification` | Implemented |

Admin (`/admin/verification`):

- Lists all doctors with verified email but pending MDCN approval
- One-click **Approve & Notify** — sets `isVerified: true`, sends approval email
- **Reject** with optional reason — deactivates the account

The Verification admin page is only visible in the sidebar for `ADMIN` role users.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web frontend | Next.js 14 (App Router) + Tailwind CSS + PWA |
| Mobile | Expo 51 (React Native) + iOS & Android |
| Offline sync | PouchDB + IndexedDB (web), SQLite via Expo (mobile) |
| API gateway | Express.js + JWT + axios proxy + PII middleware |
| Domain services | Express.js + Prisma ORM (TypeScript) |
| Database | PostgreSQL 16 (primary) + CouchDB 3.3 (offline sync) |
| Auth | JWT access tokens (15m) + refresh rotation (7d) |
| Push notifications | Web Push API + VAPID |
| ORM | Prisma 5 |
| Monorepo | Turborepo + pnpm workspaces |
| Containerisation | Docker + Docker Compose |

---

## Design System

Editorial dark theme with typography-first layout:

- **Background**: `#0C0C0C` (near-black)
- **Accent**: `#E85D4A` (coral) — actions, active states
- **Gold**: `#C9A84C` — labels, decorators
- **Typefaces**: Playfair Display (serif headings) + JetBrains Mono (labels, badges)

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens expire in 15 minutes; refresh tokens rotate on use
- PII masking enforced at the gateway — services never expose masking decisions to clients
- Every patient data access is audit-logged with actor, role, IP, and timestamp
- Rate limiting: 200 req/15 min general, 20 req/15 min on auth endpoints
- CORS restricted to configured origins only
- Helmet.js security headers on all services

---

## Demo Credentials

| Email                    | Password        | Role   | Notes                      |
| ------------------------ | --------------- | ------ | -------------------------- |
| `chikwex@doctalk.ng`     | `Chikwex@2024!` | ADMIN  | Admin — full access        |
| `dr.adeyemi@doctalk.ng`  | `DocTalk@2024!` | DOCTOR | Lagos GP, full patient data|
| `dr.okafor@doctalk.ng`   | `DocTalk@2024!` | DOCTOR | Abuja Cardiologist         |

> Sign in as a NURSE-role user to observe PII masking in the dashboard.
