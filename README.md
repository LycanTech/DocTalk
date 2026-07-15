# DocTalk

> Nigeria's offline-first medical records platform for doctors — across all specialties, anywhere in the country.

DocTalk lets licensed Nigerian doctors create, access, and sync patient records regardless of internet connectivity. It is built as an enterprise-grade monorepo: a Next.js 14 PWA, an Express + Prisma monolith API, an Expo mobile app, role-based PII masking, a Claude-powered AI clinical assistant, and a full Kubernetes deployment on Azure AKS.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Monorepo Structure](#monorepo-structure)
3. [Tech Stack](#tech-stack)
4. [Local Development](#local-development)
5. [Cloud Deployment — Azure AKS](#cloud-deployment--azure-aks)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Kubernetes Infrastructure](#kubernetes-infrastructure)
8. [Security](#security)
9. [PII Protection](#pii-protection)
10. [AI Clinical Assistant](#ai-clinical-assistant)
11. [Patient Portal](#patient-portal)
12. [Doctor Verification](#doctor-verification)
13. [Design System](#design-system)
14. [Demo Credentials](#demo-credentials)

---

## Architecture

```text
                    ┌──────────────────────────────────────────────────┐
  Browser / Mobile  │               API (Monolith) :4001                │
  ────────────────► │  Express + Prisma 5 + PostgreSQL 16               │
                    │  • JWT validation (all routes)                    │
                    │  • Role-based PII masking (NURSE sees masked data) │
                    │  • Audit log on every data-access event            │
                    │  • AI chat proxy to Anthropic Claude              │
                    └───────────────────────────────────────────────────┘
                                         │
                    ┌────────────────────────────────────────────────────┐
                    │              Shared Data Layer                      │
                    │   PostgreSQL 16 :5432      CouchDB 3.3 :5984       │
                    │   Primary relational store  Offline sync store      │
                    └────────────────────────────────────────────────────┘

  Kubernetes (AKS)
  ─────────────────────────────────────────────────────────────
  Ingress (webapprouting.kubernetes.azure.com)
    doctalk.ng        → web  :3000  (2–5 replicas, HPA)
    api.doctalk.ng    → api  :4000  (2–5 replicas, HPA)
  PostgreSQL StatefulSet (managed-csi PVC, 10 Gi)
  ACR: doctalkacr.azurecr.io
```

### Port Map

| Service              | Port | Purpose                          |
|----------------------|------|----------------------------------|
| `web` (Next.js PWA)  | 3002 | Doctor dashboard (local dev)     |
| `api` (monolith)     | 4001 | REST API + Prisma (local dev)    |
| PostgreSQL           | 5432 | Primary relational store         |
| CouchDB              | 5984 | Offline sync document store      |
| `web` (K8s)          | 3000 | Container port in cluster        |
| `api` (K8s)          | 4000 | Container port in cluster        |

---

## Monorepo Structure

```text
DocTalkApp/
├── apps/
│   ├── web/                   Next.js 14 PWA (App Router, offline, port 3002)
│   ├── mobile/                Expo 51 React Native (iOS + Android)
│   └── api/                   Express + Prisma monolith (port 4001)
├── packages/
│   ├── shared/                Types, utilities, PII masking, audit constants
│   └── ui/                    Design tokens + shared component primitives
└── infrastructure/
    ├── docker/
    │   ├── docker-compose.yml          Local dev — postgres + couchdb + api
    │   ├── docker-compose.staging.yml  Staging compose stack
    │   └── docker-compose.prod.yml     Production compose stack
    └── k8s/
        ├── namespace.yaml
        ├── configmap.yaml              Non-sensitive environment config
        ├── secrets.yaml                Gitignored — fill manually
        ├── ingress.yaml                AKS app-routing ingress
        ├── kustomization.yaml          kubectl apply -k entry point
        ├── postgres/
        │   ├── statefulset.yaml        PostgreSQL 16 StatefulSet (10 Gi PVC)
        │   └── service.yaml            Headless ClusterIP
        ├── api/
        │   ├── deployment.yaml         2 replicas, init container waits for PG
        │   ├── service.yaml            ClusterIP :4000
        │   └── hpa.yaml               HPA: 2–5 replicas at 70% CPU / 80% mem
        └── web/
            ├── deployment.yaml         2 replicas
            ├── service.yaml            ClusterIP :3000
            └── hpa.yaml               HPA: 2–5 replicas
```

---

## Tech Stack

| Layer              | Technology                                          |
|--------------------|-----------------------------------------------------|
| Web frontend       | Next.js 14 (App Router) + Tailwind CSS + PWA        |
| Animations         | Framer Motion 11 — spring physics, page transitions |
| Mobile             | Expo 51 (React Native) — iOS & Android              |
| Offline sync       | PouchDB + IndexedDB (web), Expo SQLite (mobile)     |
| API                | Express.js + Prisma 5 + PostgreSQL 16               |
| Auth               | JWT access (15 min) + refresh token rotation (7 d)  |
| Push notifications | Web Push API + VAPID                                |
| AI assistant       | Anthropic Claude (claude-haiku-4-5, streaming)      |
| ORM                | Prisma 5                                            |
| Monorepo           | Turborepo + pnpm 9 workspaces                       |
| Containerisation   | Docker multi-stage builds                           |
| Orchestration      | Azure Kubernetes Service (AKS)                      |
| Registry           | Azure Container Registry (ACR) — `doctalkacr`       |
| CI/CD              | GitHub Actions — OIDC auth, workflow_run trigger    |

---

## Local Development

### Prerequisites

| Tool          | Version   | Install                         |
|---------------|-----------|---------------------------------|
| Node.js       | 20+       | [nodejs.org](https://nodejs.org)|
| pnpm          | 9.14.4+   | `npm install -g pnpm`           |
| Docker Desktop| latest    | [docker.com](https://docker.com)|

### 1. Start Infrastructure

Postgres (and optionally CouchDB) run in Docker. The compose file only builds infra services — the API and web run natively.

```bash
docker compose -f infrastructure/docker/docker-compose.yml up postgres couchdb -d
```

Postgres is healthy when:

```bash
docker ps  # shows "healthy" for doctalk_postgres_dev
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Files

`apps/api/.env` is committed with safe dev defaults. No changes needed for basic local dev.

Key values:

```env
DATABASE_URL=postgresql://doctalk:doctalk@localhost:5432/doctalk_dev
JWT_SECRET=change-me-in-production-use-openssl-rand-base64-64
JWT_REFRESH_SECRET=change-me-in-production-use-openssl-rand-base64-64
PORT=4001
CORS_ORIGINS=http://localhost:3002
```

`apps/web/.env.local` (if missing, create it):

```env
NEXT_PUBLIC_API_URL=http://localhost:4001
```

### 4. Run Migrations and Seed

```bash
pnpm --filter @doctalk/api run db:generate
pnpm --filter @doctalk/api run db:migrate
pnpm --filter @doctalk/api run db:seed
```

The seed creates:

- **3 doctors** (DOCTOR, DOCTOR, ADMIN roles) — see [Demo Credentials](#demo-credentials)
- **10 Nigerian patients** with realistic clinical data
- **12 medical records** with vitals, prescriptions, diagnoses
- **16 appointments** across today, upcoming, and past dates

### 5. Start the App

```bash
# Starts both api (:4001) and web (:3002) via Turbo
pnpm dev
```

Or individually in separate terminals:

```bash
# Terminal 1 — API
pnpm --filter @doctalk/api dev

# Terminal 2 — Web
pnpm --filter @doctalk/web dev
```

Open [http://localhost:3002](http://localhost:3002) and log in with the [demo credentials](#demo-credentials).

### Useful Local Commands

```bash
pnpm build                        # Build all packages
pnpm test                         # Run all tests
pnpm lint                         # Lint all packages
pnpm type-check                   # TypeScript check all packages

pnpm --filter @doctalk/api db:studio   # Prisma Studio GUI (database browser)
pnpm --filter @doctalk/api db:migrate  # Apply pending migrations
pnpm --filter @doctalk/api db:seed     # Re-seed the database
```

---

## Cloud Deployment — Azure AKS

DocTalk is deployed to Azure Kubernetes Service. Images are stored in Azure Container Registry. CI/CD is handled entirely by GitHub Actions using OIDC (no long-lived credentials).

### Infrastructure Overview

| Resource                  | Value                               |
|---------------------------|-------------------------------------|
| Resource Group            | `doctalk-rg`                        |
| AKS Cluster               | `doctalk-aks`                       |
| Container Registry        | `doctalkacr.azurecr.io`             |
| Kubernetes Namespace      | `doctalk`                           |
| Ingress Class             | `webapprouting.kubernetes.azure.com`|
| Web domain                | `doctalk.ng`                        |
| API domain                | `api.doctalk.ng`                    |

### One-time Azure Setup

**1. Create resource group, ACR, and AKS:**

```bash
az group create --name doctalk-rg --location eastus

az acr create \
  --resource-group doctalk-rg \
  --name doctalkacr \
  --sku Basic

az aks create \
  --resource-group doctalk-rg \
  --name doctalk-aks \
  --node-count 2 \
  --enable-managed-identity \
  --enable-app-routing \
  --attach-acr doctalkacr \
  --generate-ssh-keys
```

**2. Create a Service Principal and configure OIDC for GitHub Actions:**

```bash
APP_ID=$(az ad app create --display-name "doctalk-github-actions" --query appId -o tsv)
az ad sp create --id $APP_ID

az role assignment create \
  --assignee $APP_ID \
  --role Contributor \
  --scope /subscriptions/<SUBSCRIPTION_ID>/resourceGroups/doctalk-rg

# Federated credential for the dev branch
az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-dev",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:LycanTech/DocTalkApp:ref:refs/heads/dev",
    "audiences": ["api://AzureADTokenExchange"]
  }'
```

**3. Add GitHub repository secrets:**

| Secret                   | Value                                  |
|--------------------------|----------------------------------------|
| `AZURE_CLIENT_ID`        | App registration client ID             |
| `AZURE_TENANT_ID`        | Azure tenant ID                        |
| `AZURE_SUBSCRIPTION_ID`  | Azure subscription ID                  |
| `DEV_API_URL`            | `https://api.doctalk.ng`               |

**4. Fill in Kubernetes secrets:**

```bash
# infrastructure/k8s/secrets.yaml — gitignored, never commit
# Fill in: POSTGRES_PASSWORD, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
# Then apply:
kubectl apply -k infrastructure/k8s/
```

### Applying Kubernetes Manifests

```bash
# Authenticate to AKS
az aks get-credentials --resource-group doctalk-rg --name doctalk-aks

# Apply all manifests (Kustomize)
kubectl apply -k infrastructure/k8s/

# Verify rollout
kubectl get pods -n doctalk
kubectl get ingress -n doctalk
```

### Viewing the Cluster Locally (Port Forward)

To inspect the running cluster without a public domain:

```bash
# Forward the web app to localhost:8080
kubectl port-forward svc/web -n doctalk 8080:3000

# Forward the API to localhost:4001
kubectl port-forward svc/api -n doctalk 4001:4000
```

---

## CI/CD Pipeline

GitHub Actions handles the full pipeline across three stages. All Azure authentication uses OIDC — no JSON credentials are stored as secrets.

```text
push to dev / staging / prod
         │
         ▼
    ┌─────────┐
    │ quality │  Type check + ESLint
    └────┬────┘
         │
         ▼
    ┌───────┐
    │ build │  Turbo build all packages
    └───┬───┘
        │
        ▼
    ┌──────┐
    │ test │  Vitest — spins up real Postgres as a service container
    └──┬───┘
       │
       ▼
    ┌────────┐
    │ docker │  Build & push api + web images to ACR
    │        │  Tags: <branch>-<sha>  and  :latest
    └────────┘
       │
       │  workflow_run trigger (fires after CI completes successfully)
       ▼
    ┌──────────┐
    │ cd-dev   │  kubectl set image → rollout status (5 min timeout)
    └──────────┘
```

### Workflow Files

| File                                | Trigger                              | Purpose                              |
|-------------------------------------|--------------------------------------|--------------------------------------|
| `.github/workflows/ci.yml`          | Push to dev/staging/prod/main        | Quality + build + test + Docker push |
| `.github/workflows/cd-dev.yml`      | `workflow_run` after CI on dev       | Deploy to AKS dev                    |
| `.github/workflows/cd-staging.yml`  | `workflow_run` after CI on staging   | Deploy to staging                    |
| `.github/workflows/cd-prod.yml`     | `workflow_run` after CI on prod      | Deploy to production                 |

### Docker Images

Both images use multi-stage builds:

**API** (`apps/api/Dockerfile`):

- `base` — Node 20 Alpine + pnpm 9.14.4
- `deps` — install lockfile-frozen dependencies
- `builder` — generate Prisma client → build TypeScript → `pnpm deploy --prod` (resolves symlinks)
- `runner` — minimal Alpine + OpenSSL + non-root user `doctalk`; runs `prisma migrate deploy` on startup

**Web** (`apps/web/Dockerfile`):

- Uses `output: "standalone"` in Next.js config
- `runner` stage copies `.next/standalone` + `.next/static`

---

## Kubernetes Infrastructure

All manifests live in `infrastructure/k8s/` and are managed with Kustomize.

### Secrets Management

`infrastructure/k8s/secrets.yaml` is **gitignored**. It must be filled manually before applying and must never be committed. Generate strong values with:

```bash
openssl rand -base64 32   # POSTGRES_PASSWORD
openssl rand -base64 64   # JWT_SECRET
openssl rand -base64 64   # JWT_REFRESH_SECRET
```

The `DATABASE_URL` password must be percent-encoded if it contains special characters:

```text
postgresql://doctalk:<url-encoded-password>@postgres:5432/doctalk
```

### PostgreSQL StatefulSet

- Image: `postgres:16-alpine`
- Storage: 10 Gi `managed-csi` PVC (Azure managed disk)
- Health: `pg_isready` liveness + readiness probes
- Service: headless ClusterIP for stable DNS (`postgres.doctalk.svc.cluster.local`)

### Horizontal Pod Autoscaler

Both `api` and `web` deployments have HPA configured:

| Deployment | Min replicas | Max replicas | CPU target | Memory target |
|------------|--------------|--------------|------------|---------------|
| `api`      | 2            | 5            | 70%        | 80%           |
| `web`      | 2            | 5            | 70%        | 80%           |

### Ingress

Uses the AKS App Routing add-on (`--enable-app-routing`):

```yaml
ingressClassName: webapprouting.kubernetes.azure.com
rules:
  - host: api.doctalk.ng   → api:4000
  - host: doctalk.ng       → web:3000
```

Get the ingress IP after applying manifests:

```bash
kubectl get ingress -n doctalk
```

Point your DNS A records for `doctalk.ng` and `api.doctalk.ng` to that IP.

---

## Security

| Control              | Implementation                                                  |
|----------------------|-----------------------------------------------------------------|
| Password hashing     | bcrypt, 12 rounds                                               |
| Access tokens        | JWT, 15-minute expiry                                           |
| Refresh tokens       | Rotating, 7-day expiry, stored hashed in `refresh_tokens`       |
| Rate limiting        | 200 req/15 min general · 20 req/15 min on auth endpoints        |
| CORS                 | Restricted to configured origins only                           |
| Security headers     | Helmet.js on all routes                                         |
| PII masking          | API-layer role-based masking (NURSE role)                       |
| Audit logging        | Every patient data access written to `audit_logs`               |
| Kubernetes secrets   | Base64 in `secrets.yaml`, never committed to git                |
| Azure auth           | OIDC federated identity — no long-lived JSON credentials        |
| Container users      | Non-root `doctalk` user (UID 1001) in all production images     |

---

## PII Protection

Patient PII is masked **at the API layer** before any data reaches the client, based on the authenticated doctor's role.

### Role Access Rules

| Role     | Data Access                                            |
|----------|--------------------------------------------------------|
| `ADMIN`  | Full unrestricted access                               |
| `DOCTOR` | Full access (clinical need)                            |
| `NURSE`  | Masked PII — can see the patient, cannot identify them |

### Fields Masked for NURSE Role

| Field         | Raw                              | Masked                    |
|---------------|----------------------------------|---------------------------|
| Phone         | `+2348012345001`                 | `+234*****5001`           |
| NHIS Number   | `NHIS-LG-2024-001`               | `NHIS-***-2024`           |
| Email         | `adaeze.okonkwo@gmail.com`       | `ad***@gmail.com`         |
| Address       | `14 Adeola Odeku St, V/Island`   | `14 Adeola Odeku***`      |
| Date of Birth | `1985-03-15`                     | `1985-**-**`              |

Masking functions: [`packages/shared/src/pii.ts`](packages/shared/src/pii.ts)

### Audit Logging

Every data-access event is written to `audit_logs` regardless of role:

```typescript
{
  actorId:    "cuid-of-doctor",
  actorEmail: "dr.adeyemi@doctalk.ng",
  actorRole:  "NURSE",
  action:     "PII:LIST_PATIENTS",
  resource:   "patient",
  ipAddress:  "102.88.12.45",
  metadata:   { role: "NURSE", piiMasked: true, count: 10 }
}
```

---

## AI Clinical Assistant

Embedded in the doctor dashboard at `/chat`. Powered by Anthropic Claude.

- Answers clinical questions using Nigerian formulary and WHO/NICE guidelines
- Context-aware: load any patient to give the AI their diagnosis history, allergies, vitals, and current medications
- Streaming responses — answers appear word-by-word in real time
- Session history — conversations persisted per doctor in `chat_messages`
- Suggests drug interactions, differential diagnoses, NHIS documentation guidance

**Setup:** add your Anthropic API key to `apps/api/.env`:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

---

## Patient Portal

Public-facing page at `/patient-portal` — no login required.

- AI assistant for common health questions
- **Message a Doctor** form — patients send inquiries to a specific doctor
- Doctor receives messages in `/inbox` and can reply with timestamps

---

## Doctor Verification

Two-step verification for all doctor registrations:

| Step | Mechanism                              | Status      |
|------|----------------------------------------|-------------|
| 1    | Email verification token sent on signup| Implemented |
| 2    | MDCN licence review by admin           | Implemented |

Admin panel at `/admin/verification` (ADMIN role only):

- Lists all doctors with verified email awaiting MDCN approval
- One-click **Approve & Notify** — sets `isVerified: true`, sends approval email
- **Reject** with optional reason — deactivates the account

---

## Design System

Apple-style editorial dark theme with glassmorphism:

| Token         | Value                        | Usage                          |
|---------------|------------------------------|--------------------------------|
| `--bg-base`   | `#0C0C0C`                    | Page background                |
| `--bg-card`   | `rgba(17,17,17,0.75)`        | Cards with `backdrop-filter`   |
| `--accent`    | `#E85D4A` (coral)            | Actions, active states         |
| `--gold`      | `#C9A84C`                    | Labels, decorators             |
| Serif         | Playfair Display             | Headings                       |
| Mono          | JetBrains Mono               | Labels, badges, numbers        |

Dark mode uses a CSS radial gradient mesh background visible through glass surfaces. The sidebar uses `backdrop-filter: blur(24px) saturate(160%)`. Active nav items animate with a Framer Motion spring-physics pill (`layoutId="sidebar-active-pill"`).

---

## Demo Credentials

| Email                   | Password        | Role   | Notes                            |
|-------------------------|-----------------|--------|----------------------------------|
| `chikwex@doctalk.ng`    | `Chikwex@2024!` | ADMIN  | Full access + verification panel |
| `dr.adeyemi@doctalk.ng` | `DocTalk@2024!` | DOCTOR | Lagos GP, full patient data      |
| `dr.okafor@doctalk.ng`  | `DocTalk@2024!` | DOCTOR | Abuja Cardiologist               |

Sign in as a NURSE-role user to observe PII masking live in the dashboard.
