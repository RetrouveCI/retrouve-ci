# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"
	
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate
WORKDIR /app

FROM base AS builder

COPY . .

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile

RUN pnpm exec turbo run build --filter=api

RUN pnpm --filter api --legacy deploy --prod /prod/api

RUN pnpm --filter @retrouve-ci/database --legacy deploy /prod/migrator

# ---- Runner : minimal production image -------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV="production" \
  PORT="3000"

# OpenSSL is required by the Prisma schema engine (migrate deploy)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder --chown=node:node /prod/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/api/dist ./dist
COPY --from=builder --chown=node:node /prod/api/package.json ./package.json

# Migrator bundle + entrypoint that runs `prisma migrate deploy` before boot
COPY --from=builder --chown=node:node /prod/migrator ./migrator
COPY --chown=node:node apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER node

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
