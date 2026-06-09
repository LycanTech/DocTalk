FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/appointments/package.json ./apps/services/appointments/
RUN pnpm install --frozen-lockfile

COPY apps/services/appointments ./apps/services/appointments
RUN pnpm --filter @doctalk/service-appointments run db:generate
RUN pnpm --filter @doctalk/service-appointments run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/services/appointments/dist ./dist

EXPOSE 4014
ENV PORT=4014 NODE_ENV=production
CMD ["node", "dist/index.js"]
