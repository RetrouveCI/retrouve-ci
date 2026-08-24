# syntax=docker/dockerfile:1
#
# Build context MUST be the monorepo root:
#   docker build -f apps/admin/Dockerfile -t retrouveci-admin .

# ---- Base : Node + pnpm ----------------------------------------------------
FROM node:24-bookworm-slim AS base
ENV PNPM_HOME="/pnpm" \
	PATH="/pnpm:$PATH" \
	CI="true" \
	TURBO_TELEMETRY_DISABLED="1"
RUN corepack enable && corepack prepare pnpm@11.18.0 --activate
WORKDIR /app

# ---- Builder : install, build the admin, then bundle -----------------------
FROM base AS builder

COPY . .

# `pnpm install` resolves this app's `catalog:` ranges from the root
# pnpm-workspace.yaml, and the build needs the sibling packages it depends on,
# so the whole workspace has to be in the context.
RUN test -f pnpm-workspace.yaml || { \
	echo "ERROR: the build context must be the monorepo root, not apps/admin/."; \
	echo "       docker build -f apps/admin/Dockerfile -t retrouveci-admin ."; \
	exit 1; \
	}

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
	pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@app/admin
RUN pnpm --filter @app/admin --legacy deploy --prod /prod/admin

# ---- Runner : minimal production image -------------------------------------
FROM node:24-bookworm-slim AS runner
# `API_URL` and `PUBLIC_APP_URL` are read at runtime too, so one image serves
# every environment; `API_URL` is required and the server refuses to start
# without it.
# `ADMIN_APP_URL` is read at runtime (`process.env`), so it is supplied at
# `docker run` time rather than baked here: it is the public origin the emailed
# password-reset link must point at, which the container cannot infer behind a
# reverse proxy.
ENV NODE_ENV="production" \
	PORT="3000"

WORKDIR /app
COPY --from=builder --chown=node:node /prod/admin/node_modules ./node_modules
COPY --from=builder --chown=node:node /prod/admin/build ./build
COPY --from=builder --chown=node:node /prod/admin/package.json ./package.json

USER node

EXPOSE 3000

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
