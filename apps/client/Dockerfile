# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root:
#   docker build -f apps/client/Dockerfile -t retrouveci-client .

# ---- Base : Node + pnpm ----------------------------------------------------
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---- Builder : install, build the client, then bundle ----------------------
FROM base AS builder

COPY . .

# `pnpm install` resolves this app's `catalog:` ranges from the root
# pnpm-workspace.yaml, and the build needs the sibling packages it depends on,
# so the whole workspace has to be in the context.
RUN test -f pnpm-workspace.yaml || { \
	echo "ERROR: the build context must be the monorepo root, not apps/client/."; \
	echo "       docker build -f apps/client/Dockerfile -t retrouveci-client ."; \
	exit 1; \
	}

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@app/client
RUN pnpm --filter @app/client --legacy deploy --prod /prod/client

# ---- Runner : minimal production image -------------------------------------
FROM node:24-bookworm-slim AS runner
# `API_URL` is read at runtime, so one image serves every environment. It is
# required: the server refuses to start without it rather than silently calling
# its own origin, which is what the former build-time `VITE_API_URL` did.
ENV NODE_ENV="production" \
	PORT="3000"

WORKDIR /app
COPY --from=builder --chown=node:node /prod/client/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/client/build ./build
COPY --from=builder --chown=node:node /prod/client/package.json ./package.json

USER node

EXPOSE 3000

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
