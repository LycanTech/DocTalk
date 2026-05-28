FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/shared ./packages/shared
COPY apps/api/prisma ./apps/api/prisma
COPY apps/gateway/package.json ./apps/gateway/package.json

RUN pnpm install --frozen-lockfile

COPY apps/gateway ./apps/gateway

RUN pnpm --filter @doctalk/gateway run db:generate

EXPOSE 4000
CMD ["pnpm", "--filter", "@doctalk/gateway", "dev"]
