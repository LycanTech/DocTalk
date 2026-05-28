FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/patients/package.json ./apps/services/patients/package.json

RUN pnpm install --frozen-lockfile

COPY apps/services/patients ./apps/services/patients

RUN pnpm --filter @doctalk/service-patients run db:generate

EXPOSE 4012
CMD ["pnpm", "--filter", "@doctalk/service-patients", "dev"]
