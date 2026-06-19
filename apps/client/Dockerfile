# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root:
#   docker build -f apps/client/Dockerfile -t retrouveci-client .

# ---- Base : Node + pnpm ----------------------------------------------------
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"
RUN corepack enable && corepack prepare pnpm@11.5.3 --activate
WORKDIR /app

# ---- Builder : install, build the client, then bundle ----------------------
FROM base AS builder

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=client
RUN pnpm --filter client --legacy deploy --prod /prod/client

# ---- Runner : minimal production image -------------------------------------
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV="production" \
	PORT="3000"
WORKDIR /app
COPY --from=builder --chown=node:node /prod/client/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/client/build ./build
COPY --from=builder --chown=node:node /prod/client/package.json ./package.json
USER node
EXPOSE 3000
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
