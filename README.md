# RetrouveCI

**RetrouveCI** is a lost-and-found platform for Côte d'Ivoire. Users can post
listings for lost or found items and order QR-code stickers that, when scanned,
redirect finders to a contact page. The UI is entirely in French.

This repository is a [Turborepo](https://turbo.build/repo) monorepo containing
two React Router v7 web applications, a NestJS API, and a set of shared
packages.

## Apps

| App                             | Port | Stack            | Description                |
| ------------------------------- | ---- | ---------------- | -------------------------- |
| [client](apps/client/README.md) | 3000 | React Router v7  | Public-facing web app      |
| [admin](apps/admin/README.md)   | 3001 | React Router v7  | Internal admin dashboard   |
| `api`                           | 3002 | NestJS (Fastify) | Backend REST API + Swagger |

## Packages

| Package                          | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `@retrouve-ci/database`          | Prisma schema, migrations & generated client       |
| `@retrouve-ci/ui`                | Shared shadcn/ui component library (source-only)   |
| `@retrouve-ci/eslint-config`     | Shared ESLint configs (base, next, react-internal) |
| `@retrouve-ci/typescript-config` | Shared `tsconfig` presets                          |
| `@retrouve-ci/vitest-config`     | Shared Vitest presets (base, react)                |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (CI and Docker images use Node 22)
- [pnpm](https://pnpm.io/) 11 (pinned via `packageManager`)
- [Docker](https://www.docker.com/) — for local Postgres and Redis

## Getting Started

```bash
# Install all dependencies
pnpm install

# Start Postgres (:5432) and Redis (:6379)
docker compose up -d

# Set up environment files (see apps/api/.env.example) and apply migrations
pnpm db:generate
pnpm db:deploy

# Start all apps in development mode (client :3000, admin :3001, api :3002)
pnpm dev
```

## Commands

All commands are run from the repo root.

```bash
pnpm dev           # Start all apps in parallel
pnpm build         # Build all packages and apps (packages build first)
pnpm lint          # Lint all workspaces
pnpm check-types   # Type-check all workspaces
pnpm test          # Run unit tests (Vitest — currently the api app only)
pnpm format        # Format with Prettier
pnpm format:check  # Verify formatting without writing (used by CI)
```

Database (Prisma — schema in `packages/database`):

```bash
pnpm db:generate   # Generate the Prisma client
pnpm db:migrate    # Create/apply a migration in development
pnpm db:deploy     # Apply pending migrations (production)
pnpm db:studio     # Open Prisma Studio
```

To run a single app or package in isolation:

```bash
pnpm --filter client dev
pnpm --filter admin dev
pnpm --filter api dev
pnpm --filter @retrouve-ci/ui build
```

## Tech Stack

**Frontends (`client`, `admin`)**

- **React Router v7** (Vite, SSR) with React 19 and TypeScript 5.9
- **Tailwind CSS v4** — configured via CSS `@theme` directives
- **shadcn/ui** — components from `@retrouve-ci/ui`, Lucide icons
- **`@conform-to/react` + `@conform-to/zod`** for all forms
- **better-auth** for authentication (phone number on client, email/password on
  admin)

**Backend (`api`)**

- **NestJS 11** on the **Fastify** adapter, REST + Swagger (`/docs`)
- **Domain-Driven / Clean Architecture** (`domains` / `presentation` /
  `infrastructure` / `shared`)
- **Prisma 7** over Postgres via driver adapters (`@prisma/adapter-pg`)
- **BullMQ** (Redis) for background jobs, **better-auth** for auth
- **Vitest** for unit tests

## CI/CD & Docker

GitHub Actions workflows are defined in
[`.github/workflows`](.github/workflows):

- **`test-ci.yml`** — runs format, type-check, lint and tests on every push to
  `main` and every pull request.
- **`release.yml`** — on a merged PR into `main`, creates the next semver tag
  (bump derived from PR labels). Requires a `PAT_RETROUVECI` PAT so the tag
  triggers the Docker workflow.
- **`docker.yml`** — on a new version tag, builds and pushes the `api`, `client`
  and `admin` images to Docker Hub. Requires `DOCKER_USERNAME` and
  `DOCKER_ACCESS_TOKEN` secrets.

Each app ships a multi-stage `Dockerfile` (build context = repo root). The api
image runs `prisma migrate deploy` on startup via its `entrypoint.sh`.

## Dependency Updates

This project uses [Renovate](https://docs.renovatebot.com/) to keep dependencies
up to date automatically. Configuration is in [`renovate.json`](renovate.json).

To activate it, install the
[Renovate GitHub App](https://github.com/apps/renovate) on the repository. Once
installed, Renovate will:

- Open a **Dependency Dashboard** issue listing all pending updates
- Create PRs grouped by ecosystem (React, Tailwind, Radix UI, etc.)
- **Auto-merge** patch and minor updates for dev dependencies
- Require manual review for production dependency updates and major versions

## Architecture Notes

- `@retrouve-ci/ui` is consumed directly from source via TypeScript path aliases
  — no build step is required before starting the apps. Turborepo's
  `"dependsOn": ["^build"]` only applies to packages that have a `build` script.
- `@retrouve-ci/database` **does** have a build step (`prisma generate` + `tsc`)
  and is built before the `api` via `^build`.
- All shadcn/ui components live in `packages/ui/src/components/ui/` and are
  imported by apps via the `@retrouve-ci/ui/components` barrel export.

See [`CLAUDE.md`](CLAUDE.md) for detailed architecture and conventions.
