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

# ─── Stage 4: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 doctalk

COPY --from=builder --chown=doctalk:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=doctalk:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=doctalk:nodejs /app/apps/api/prisma ./prisma
COPY --from=builder --chown=doctalk:nodejs /app/node_modules/.prisma ./.prisma

USER doctalk
EXPOSE 4000
ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
