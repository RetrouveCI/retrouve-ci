# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root:
#   docker build -f apps/admin/Dockerfile -t retrouveci-admin .

# ---- Base : Node + pnpm ----------------------------------------------------
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate
WORKDIR /app

# ---- Builder : install, build the admin, then bundle -----------------------
FROM base AS builder
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=admin
RUN pnpm --filter admin --legacy deploy --prod /prod/admin

# ---- Runner : minimal production image -------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV="production" \
	PORT="3001"
WORKDIR /app
COPY --from=builder --chown=node:node /prod/admin/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/admin/build ./build
COPY --from=builder --chown=node:node /prod/admin/package.json ./package.json
USER node
EXPOSE 3001
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
