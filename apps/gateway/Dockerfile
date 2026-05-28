FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/prisma ./apps/api/prisma
COPY apps/gateway/package.json ./apps/gateway/
RUN pnpm install --frozen-lockfile

COPY packages/shared ./packages/shared
COPY apps/gateway ./apps/gateway
RUN pnpm --filter @doctalk/shared build
RUN pnpm --filter @doctalk/gateway run db:generate
RUN pnpm --filter @doctalk/gateway run build

FROM node:20-alpine AS runner
WORKDIR /app
# node_modules/@doctalk/shared is a pnpm symlink → ../../packages/shared
# so we copy both to preserve the resolution
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/gateway/dist ./dist

EXPOSE 4000
ENV PORT=4000 NODE_ENV=production
CMD ["node", "dist/index.js"]
