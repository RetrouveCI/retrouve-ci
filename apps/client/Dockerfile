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

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Vite inlines `import.meta.env.VITE_API_URL` at build time, so an image built
# without it is permanently pointed at nothing: `apiFetch` resolves every call
# against the client's own origin. Refuse to produce that image.
RUN test -n "$VITE_API_URL" || { \
	echo "ERROR: VITE_API_URL is required at build time."; \
	echo "       docker build -f apps/client/Dockerfile \\"; \
	echo "         --build-arg VITE_API_URL=https://api.example.com \\"; \
	echo "         -t retrouveci-client ."; \
	exit 1; \
	}

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
ENV NODE_ENV="production" \
	PORT="3000"
WORKDIR /app
COPY --from=builder --chown=node:node /prod/client/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/client/build ./build
COPY --from=builder --chown=node:node /prod/client/package.json ./package.json
USER node
EXPOSE 3000
CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
