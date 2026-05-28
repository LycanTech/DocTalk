FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/auth/package.json ./apps/services/auth/package.json

RUN pnpm install --frozen-lockfile

COPY apps/services/auth ./apps/services/auth

RUN pnpm --filter @doctalk/service-auth run db:generate

EXPOSE 4011
CMD ["pnpm", "--filter", "@doctalk/service-auth", "dev"]
