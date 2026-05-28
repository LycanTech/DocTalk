FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/records/package.json ./apps/services/records/
RUN pnpm install --frozen-lockfile

COPY apps/services/records ./apps/services/records
RUN pnpm --filter @doctalk/service-records run db:generate
RUN pnpm --filter @doctalk/service-records run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/services/records/dist ./dist

EXPOSE 4013
ENV PORT=4013 NODE_ENV=production
CMD ["node", "dist/index.js"]
