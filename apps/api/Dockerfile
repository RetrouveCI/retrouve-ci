# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root:
#   docker build -f apps/api/Dockerfile -t retrouveci-api .

# ---- Base : Node + pnpm ----------------------------------------------------
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"

RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---- Builder : install, build the api, then bundle -------------------------
FROM base AS builder

COPY . .

# `pnpm install` resolves this app's `catalog:` ranges from the root
# pnpm-workspace.yaml, so the whole workspace has to be in the context. Built
# from `apps/api/`, the install fails a minute later on what reads like a stale
# lockfile, so name the real cause up front.
RUN test -f pnpm-workspace.yaml || { \
	echo "ERROR: the build context must be the monorepo root, not apps/api/."; \
	echo "       docker build -f apps/api/Dockerfile -t retrouveci-api ."; \
	exit 1; \
	}

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile

RUN pnpm exec turbo run build --filter=@app/api

RUN pnpm --filter @app/api --legacy deploy --prod /prod/api

RUN pnpm --filter @app/database --legacy deploy /prod/migrator

# ---- Runner : minimal production image -------------------------------------
FROM node:24-bookworm-slim AS runner
ENV NODE_ENV="production" \
  PORT="3333"

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
# Taken from the builder, not the context: a second context read would race the
# guard above and fail first with an unrelated "not found".
COPY --from=builder --chown=node:node --chmod=755 /app/apps/api/entrypoint.sh ./entrypoint.sh

USER node

EXPOSE 3333

ENTRYPOINT ["./entrypoint.sh"]
