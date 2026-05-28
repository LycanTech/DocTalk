FROM node:20-alpine AS base
RUN npm install -g pnpm

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/appointments/package.json ./apps/services/appointments/package.json

RUN pnpm install --frozen-lockfile

COPY apps/services/appointments ./apps/services/appointments

RUN pnpm --filter @doctalk/service-appointments run db:generate

EXPOSE 4014
CMD ["pnpm", "--filter", "@doctalk/service-appointments", "dev"]
