FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/records/package.json ./apps/services/records/package.json

RUN pnpm install --frozen-lockfile

COPY apps/services/records ./apps/services/records

RUN pnpm --filter @doctalk/service-records run db:generate

EXPOSE 4013
CMD ["pnpm", "--filter", "@doctalk/service-records", "dev"]
