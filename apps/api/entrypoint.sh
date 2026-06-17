#!/bin/sh
# Entrypoint for the RetrouveCI API container.
# Applies pending Prisma migrations, then starts the API (passed as CMD).
set -e

echo "▶ Applying database migrations…"
(cd /app/migrator && ./node_modules/.bin/prisma migrate deploy)

echo "▶ Starting API…"
exec node dist/main