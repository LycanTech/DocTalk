FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/notifications/package.json ./apps/services/notifications/
RUN pnpm install --frozen-lockfile

COPY apps/services/notifications ./apps/services/notifications
RUN pnpm --filter @doctalk/service-notifications run db:generate
RUN pnpm --filter @doctalk/service-notifications run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/services/notifications/dist ./dist

EXPOSE 4015
ENV PORT=4015 NODE_ENV=production
CMD ["node", "dist/index.js"]
