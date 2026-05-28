FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/notifications/package.json ./apps/services/notifications/package.json

RUN pnpm install --frozen-lockfile

COPY apps/services/notifications ./apps/services/notifications

RUN pnpm --filter @doctalk/service-notifications run db:generate

EXPOSE 4015
CMD ["pnpm", "--filter", "@doctalk/service-notifications", "dev"]
