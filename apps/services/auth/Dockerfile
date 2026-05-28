FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/auth/package.json ./apps/services/auth/
RUN pnpm install --frozen-lockfile

COPY apps/services/auth ./apps/services/auth
RUN pnpm --filter @doctalk/service-auth run db:generate
RUN pnpm --filter @doctalk/service-auth run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/services/auth/dist ./dist

EXPOSE 4011
ENV PORT=4011 NODE_ENV=production
CMD ["node", "dist/index.js"]
