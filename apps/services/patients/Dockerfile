FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/prisma ./apps/api/prisma
COPY apps/services/patients/package.json ./apps/services/patients/
RUN pnpm install --frozen-lockfile

COPY apps/services/patients ./apps/services/patients
RUN pnpm --filter @doctalk/service-patients run db:generate
RUN pnpm --filter @doctalk/service-patients run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/services/patients/dist ./dist

EXPOSE 4012
ENV PORT=4012 NODE_ENV=production
CMD ["node", "dist/index.js"]
