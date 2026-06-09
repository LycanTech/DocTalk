# ─── Stage 1: Base ────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

# ─── Stage 2: Dependencies ────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ─── Stage 3: Build ───────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @doctalk/shared build
RUN pnpm --filter @doctalk/api run db:generate
RUN pnpm --filter @doctalk/api build
# pnpm deploy produces a real (non-symlink) node_modules with Prisma engines included
RUN pnpm --filter @doctalk/api deploy --prod /deploy

# ─── Stage 4: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 doctalk

COPY --from=builder --chown=doctalk:nodejs /deploy/node_modules ./node_modules
COPY --from=builder --chown=doctalk:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=doctalk:nodejs /app/apps/api/prisma ./prisma

USER doctalk
EXPOSE 4000
ENV NODE_ENV=production

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/index.js"]
