---
name: docker-conventions
description: Conventions Docker et Docker Compose du monorepo (images multi-stage légères et sécurisées, compose dev/staging, .env.example). À utiliser pour écrire ou réviser un Dockerfile, un docker-compose.yml ou un .dockerignore d'une app déployable.
---

# Docker — images légères, sécurisées, reproductibles

## Dockerfile (multi-stage)

Chaque app expose un `Dockerfile` à sa racine, systématiquement en **multi-stage** (base → deps → builder → runner) pour séparer build et image finale.

Points clés du stage final `runner` :

```dockerfile
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/mon-app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/mon-app/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

Le build utilise `pnpm turbo build --filter=mon-app` et `pnpm install --frozen-lockfile --prefer-offline`.

### Règles Dockerfile

- ✅ `node:22-alpine` comme image de base (LTS, légère).
- ✅ Build multi-stage — l'image finale ne contient ni `devDependencies` ni sources.
- ✅ `pnpm install --frozen-lockfile` en CI et prod.
- ✅ `USER node` dans `runner` — jamais root.
- ✅ Toujours un `HEALTHCHECK`.
- ❌ Jamais `COPY . .` dans le stage final — uniquement les artefacts compilés.
- ❌ Jamais de secrets dans le Dockerfile/layers — secrets Docker BuildKit si besoin.
- ❌ Jamais commiter un `.env` avec de vraies valeurs — seulement `.env.example`.

## `.dockerignore`

`node_modules`, `dist`, `.turbo`, `.env*`, `*.log`, `coverage`, `.git`, `.github`, `*.md`.

## Docker Compose (dev local + staging uniquement)

La production passe par les pipelines CI/CD, jamais par le compose.

- ✅ Nommer le compose avec `name:` pour éviter les conflits de préfixes.
- ✅ `healthcheck` sur tout service dont d'autres dépendent.
- ✅ `depends_on` avec `condition: service_healthy` — jamais sans condition.
- ✅ Valeurs sensibles via `.env` — jamais en dur.
- ✅ Nommer explicitement volumes et réseau.
- ✅ `restart: unless-stopped` en dev/staging.
- ❌ Ne pas exposer les ports des DB sans les lier à `127.0.0.1` en local.
- ❌ Jamais le compose en production.

## `.env.example`

Chaque projet embarque un `.env.example` à jour : toutes les variables requises, aucune valeur sensible.
