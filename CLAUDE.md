# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project overview

**RetrouveCI** is a lost-and-found platform for Côte d'Ivoire. Users can post
listings for lost/found items and use QR-code stickers that, when scanned,
redirect to a contact page. The UI is entirely in French.

## Commands

All commands are run from the repo root using pnpm and Turborepo.

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in parallel (client :3000, admin :3001, api :3002)
pnpm build            # Build all packages and apps (packages build first)
pnpm lint             # Lint all workspaces
pnpm typecheck        # Type-check all workspaces
pnpm test             # Run unit tests (Vitest — currently the api app only)
pnpm format           # Format with Prettier (ts, tsx, js, jsx, json, md, css)
pnpm format:check     # Verify formatting without writing (used by CI)
```

Database (Prisma — schema lives in `packages/database`):

```bash
pnpm db:generate      # Generate the Prisma client
pnpm db:migrate       # Create/apply a migration in development
pnpm db:deploy        # Apply pending migrations (production)
pnpm db:studio        # Open Prisma Studio
```

Postgres and Redis for local development are provided by `docker-compose.yml`:

```bash
docker compose up -d  # Start Postgres (:5432) and Redis (:6379)
```

To run a single app or package in isolation:

```bash
pnpm --filter @app/client dev
pnpm --filter @app/admin dev
pnpm --filter @app/api dev
pnpm --filter @app/ui build
```

Tests are run with **Vitest**. Only the `api` app currently has tests
(`pnpm --filter @app/api test`); the frontends have no test suite yet.

## Architecture

### Monorepo layout

```text
apps/
  client/   # Public-facing app (React Router v7 / Vite, port 3000)
  admin/    # Admin dashboard (React Router v7 / Vite, port 3001)
  api/      # Backend REST API (NestJS / Fastify, port 3002)
packages/
  database/            # Prisma schema, migrations & generated client (@app/database)
  ui/                  # Shared component library (source-only, no build step)
  eslint-config/       # Shared ESLint configs (base, next, react-internal)
  typescript-config/   # Shared tsconfig presets
  vitest-config/       # Shared Vitest presets (base, react)
```

### Shared UI package (`packages/ui`)

`@app/ui` is the **single shared shadcn/ui component library** for the entire
monorepo. All shadcn components live in `packages/ui/src/components/ui/` and are
consumed by both apps through the package's barrel exports.

**All new components must be added to `packages/ui/src/components/ui/`**, never
inside an app's local directory. To add a component, run the shadcn CLI from the
package:

```bash
cd packages/ui && npx shadcn add <component>
```

Or from an app (both `components.json` files point to the shared package):

```bash
cd apps/client && npx shadcn add <component>
```

The package exports:

- `@app/ui/styles` — design tokens + Tailwind base (imported by apps)
- `@app/ui/utils` — the `cn()` helper
- `@app/ui/components` — all UI components (barrel export)
- `@app/ui/hooks` — shared hooks

**This package does not need to be built** for apps to consume it — TypeScript
paths in each app's `tsconfig.json` resolve imports directly to `src/`.
Turborepo's `"dependsOn": ["^build"]` applies only when the package has a build
script.

### Database package (`packages/database`)

`@app/database` owns the **Prisma schema, migrations and generated client**. It
is the single source of truth for the data model and is consumed by the `api`
app via its barrel export (`prisma`, `createPrismaClientOptions`, and all
generated types).

- The schema lives in `packages/database/prisma/schema.prisma`; the client is
  generated into `src/generated/prisma` (provider `prisma-client`, CJS).
- Connections use Prisma **driver adapters** (`@prisma/adapter-pg` over `pg`),
  with the connection string read from `PGBOUNCER_URL` or `DATABASE_URL`.
- Unlike `ui`, this package **has a build step** (`prisma generate` + `tsc`) and
  apps resolve it through its emitted `dist`, so it builds before the `api` via
  Turborepo's `^build`.
- Prisma's CLI is driven by `prisma.config.ts` (paths + `DATABASE_URL` via
  dotenv), not by a `url` in the datasource block.

### Backend API app (`apps/api`)

A **NestJS (Fastify adapter)** REST API on port **3002**, with Swagger exposed
at `/docs` in non-production (or when `ENABLE_SWAGGER=true`). It follows a
**Domain-Driven / Clean Architecture** layout under `src/`:

```text
domains/          # Business core, one folder per bounded context
  <domain>/         # use-cases, models, repository, validators, mappers, errors, types
infrastructure/   # Framework/IO wiring: database, auth, queue (BullMQ), seeder
presentation/     # HTTP layer: controllers + DTOs, one folder per domain
shared/           # Cross-cutting: errors, exception filters
```

- Domains: `contact-messages`, `events`, `lost-items`, `matching`,
  `notifications`, `qr-codes`, `reporting`, `sticker-orders`. Each keeps its
  use-cases free of NestJS/HTTP concerns; controllers in `presentation/` are
  thin and delegate to use-cases.
- Auth is **better-auth** (`@thallesp/nestjs-better-auth`): phone-number based
  for the client, email/password + admin role for the admin app.
- Background jobs (e.g. match notifications) run on **BullMQ** backed by Redis.
- A startup **seeder** creates the super admin and a mock user from env vars
  when absent.
- Validation uses NestJS `ValidationPipe` (`whitelist` + `forbidNonWhitelisted`)
  with `class-validator` DTOs; domain errors are translated to HTTP responses by
  `DomainExceptionFilter`.
- Tests are **Vitest** (`*.spec.ts` colocated with use-cases, validators,
  mappers and controllers).

For where new code belongs (domains vs presentations vs infrastructures), use
the `backend-conventions` skill (`.claude/skills/backend-conventions/`). Note
that the layer names above are the **current** ones — the target layout, and the
plan to get there, are in [MIGRATION-PLAN.md](MIGRATION-PLAN.md).

### Frontend apps (React Router v7)

Both apps share the same stack:

- **React Router v7** (Vite, SSR) with React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components imported via `@app/ui/components`
- **Forms are mid-migration** from `@conform-to/*` to **react-hook-form + zod**
  (E7 of [MIGRATION-PLAN.md](MIGRATION-PLAN.md)). `client`'s `routes/auth` is on
  react-hook-form; every other form in both apps is still on Conform. New forms
  use react-hook-form.

The two apps are **not** on the same layout right now. `apps/client` has moved
to the target one, `app/routes/<area>/<page>/`; `apps/admin` is still on
`app/features/[feature]/` until E13.5. Both keep `servers/*.loader.ts` /
`servers/*.action.ts` for all server-side data access (see conventions below).

### Client app (`apps/client`)

Route structure (all under `app/`):

- `/` — homepage
- `/posts`, `/posts/[id]` — browse and view listings
- `/publish`, `/publish/lost`, `/publish/found` — post a listing
- `/stickers`, `/stickers/order` — QR sticker info and ordering
- `/account`, `/account/posts`, `/account/orders`, `/account/stickers`,
  `/account/settings` — user account
- `/auth` — auth entry point with shared layout (`auth/layout.tsx`)
  - `/auth/login`, `/auth/register`, `/auth/password-forgotten`,
    `/auth/reset-password` — individual auth pages
- `/about`, `/contact`, `/download`, `/privacy`, `/terms`

> **`apps/client` now uses the target layout** (E13 of
> [MIGRATION-PLAN.md](MIGRATION-PLAN.md)):
>
> ```text
> app/routes/<area>/<page>/   _index.tsx, servers/, components/, hooks/,
>                             helpers/, mappers/, types/
> app/components/             components used across routes
> app/context/                auth.tsx, theme.tsx
> app/shared/                 constants/, helpers/, hooks/, mappers/, types/,
>                             utils/
> ```
>
> A page is `_index.tsx`; `routes.ts` resolves route modules **by path**, so a
> move there is only caught by `pnpm build`, never by `typecheck` alone. An area
> folder may hold the `components/`, `servers/` and `types/` its sub-routes
> share (see `routes/publish/`, `routes/auth/`). `apps/admin` still uses
> `app/features/`, and the `frontend-conventions` skill still describes that
> older layout until E13.6.

Auth is phone-number based via better-auth (`phoneNumberClient` plugin).
`AuthContext` (`app/context/auth.tsx`) wraps `authClient.useSession()` for
client-side session state (`user`, `isAuthenticated`, `login`, `logout`).
Server-side, `app/shared/helpers/session.server.ts` exposes `getServerSession` /
`requireServerSession`, which forward the request's `Cookie` header to
`/api/auth/get-session` — used by route loaders to gate server data fetches.

#### Client app conventions (loader/action + Zod)

- UI components never call `apiFetch` or `authClient` directly — all API access
  goes through a feature's `servers/*.loader.ts` / `servers/*.action.ts`
  (server-side) or a dedicated `helpers/*.client.ts` wrapper (client-side calls
  that manage cookies/sessions, e.g.
  `routes/auth/helpers/phone-auth.client.ts`). In `routes/auth`, the two
  endpoints that create/refresh the better-auth session cookie
  (`sign-in/phone-number` via `AuthContext.login`, and `phone-number/verify` via
  `lib/phone-auth.client.ts`) are the only auth calls made client-side — the
  browser needs the `Set-Cookie` response directly, and this repo has no
  server-side mechanism to forward `Set-Cookie` from an API response back
  through a React Router action. Every other auth mutation (`send-otp`,
  `request-password-reset`, `reset-password`) goes through
  `servers/*.action.ts`, using the `intent` field pattern when a route has more
  than one action (e.g.
  `routes/auth/reset-password/servers/reset-password.action.ts`).
- Every form is schema-driven — no hand-rolled `useState` validation. New and
  migrated forms use **react-hook-form**: `useForm` with
  `standardSchemaResolver(schema)` from `@hookform/resolvers/standard-schema`,
  plus `Controller` (or `useController`, when one component takes several fields
  as a flat prop contract). `FormInputField` / `FormTextareaField` from
  `@app/ui/components/form` wrap the common single-input case. Forms not yet
  migrated still use `@conform-to/react` + `@conform-to/zod` (`useForm`,
  `useInputControl`, `getFormProps`, `getZodConstraint`, `parseWithZod`); do not
  add new ones.
- Actions returning `{ ok, error }` are consumed through
  `shared/hooks/use-action-fetcher.ts`, which fires `onOk` / `onError` once per
  response — not through a hand-rolled `useEffect` on `fetcher.data`.
- Each route feature owns its own Zod schema as a sibling `*.schema.ts` file
  (e.g. `routes/auth/login/login.schema.ts`,
  `routes/account/settings/settings.schema.ts`). Small schemas may be duplicated
  across features rather than shared, to keep each feature self-contained.
- Route `index.tsx` files stay thin: page-level state (current step, layout,
  redirects) only. Per-section/per-step form logic is extracted into components
  under that feature's own `components/` folder (e.g.
  `routes/auth/register/components/otp-step-section.tsx`,
  `routes/account/settings/components/security-section.tsx`). Area-level UI
  primitives (e.g. `routes/auth/components/`) stay separate from these
  feature-owned section components.

### Admin app (`apps/admin`)

Migrated from Next.js App Router to **React Router v7 (Vite, SSR)** with the
same feature-based architecture as `apps/client`. Auth is email/password via
better-auth (`adminClient()` plugin, role check `role === 'admin'`).

Route structure (defined in `app/routes.ts`):

- `/` — dashboard overview (mock stats and charts)
- `/contact-messages` — contact form submissions (real API: `contact-messages`
  domain)
- `/orders` — sticker orders (real API: `sticker-orders` domain)
- `/qr`, `/qr/generate`, `/qr/:code` — QR tokens (real API: `qr-codes` domain)
- `/events` — community events (real API: `events` domain)
- `/notifications` — admin notifications (real API: `notifications` domain)
- `/posts` — lost/found listings moderation (real API: `lost-items` domain)
- `/users`, `/users/:id` — user management (mock — no API domain yet)
- `/administrators` — admin account management (mock — no API domain yet)
- `/profile` — admin profile (better-auth session data; password change via
  `authClient.changePassword`)
- `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` — auth pages

All dashboard routes are nested under `shared/components/dashboard-layout.tsx`.
Every dashboard loader calls `requireAdminSession(request)` (from
`shared/helpers/session.server.ts`), which forwards the `Cookie` header to
`/api/auth/get-session` and throws `redirect('/auth/login')` if no valid admin
session is found.

#### Admin app conventions

> **`apps/admin` is mid-restructure** (E13). `app/shared/` has moved to the
> target layout — `app/components/`, `app/context/`, and
> `app/shared/{constants,helpers,utils}/`. `app/features/` has **not** moved
> yet; it becomes `app/routes/dashboard/<page>/` in E13.5, and
> `dashboard-layout.tsx` and `not-found.tsx` stay in `shared/components/` until
> then because `routes.ts` resolves them by path.

Identical to the client app conventions above, with these admin-specific notes:

- `shared/helpers/auth-client.ts` uses better-auth's `adminClient()` plugin for
  admin-only operations. `shared/helpers/session.server.ts` provides
  `getServerSession` / `requireAdminSession` — these replace the old `AuthGuard`
  client component.
- Password change (`features/profile`) is the only client-side auth exception:
  `lib/profile.client.ts` calls `authClient.changePassword` directly (browser
  needs the `Set-Cookie` response). Login (`features/auth/login`) similarly
  calls `authClient.signIn.email` client-side via `lib/login.client.ts`.
- For sections with no API domain (`users`, `administrators`), mock data is
  inlined in `servers/*.loader.ts` with `id: string` (forward-compatible).
  Actions return mock mutation results; real persistence deferred until API
  domains exist.
- The `components/topbar.tsx` fetches the unread notification count on mount via
  `apiFetch('/notifications/unread-count')` with `credentials: 'include'`
  (client-side, since the topbar is part of the dashboard layout and not owned
  by the notifications feature).

### Styling

Tailwind CSS v4 is used throughout with no JS config file — everything is
configured via CSS `@theme` directives. The design token source of truth is
`packages/ui/src/styles/globals.css` (RetrouveCI brand colors, shadcn CSS
variables, animations, utilities). Each app's `app/globals.css` imports it:

```css
@import '@app/ui/styles';
@source '../../../packages/ui/src';
```

The `@source` directive tells Tailwind to scan the shared package's source files
so component class names are included in the generated CSS. No `ui-` prefix is
used — all Tailwind classes are standard. Apps can add app-specific overrides
after the import in their own `app/globals.css`.

### CI/CD and Docker

GitHub Actions workflows live in `.github/workflows/`:

- **`test-ci.yml`** — on every push to `main` and every pull request. Installs
  with pnpm, builds `@app/database` (so Prisma types resolve), then runs
  `format:check`, `typecheck`, `lint` and `test`.
- **`release.yml`** — when a PR is **merged** into `main`. Uses
  `K-Phoen/semver-release-action` to create the next semver tag; the bump is
  derived from the merged PR's labels (defaults to patch). It must push the tag
  with a **PAT** (`secrets.PAT_RETROUVECI`), because a tag pushed with the
  default `GITHUB_TOKEN` would not trigger `docker.yml`.
- **`docker.yml`** — on a new version tag (`*.*.*`). Builds and pushes the
  `api`, `client` and `admin` images to Docker Hub (matrix), tagged with the
  version and `latest`. Requires `secrets.DOCKER_USERNAME` and
  `secrets.DOCKER_ACCESS_TOKEN`.

Each app has a multi-stage **`Dockerfile`** (build context = repo root). The
build runs `turbo run build --filter=<app>` then `pnpm deploy` to produce a
self-contained runtime bundle. Notes:

- `pnpm deploy` needs `--legacy` (pnpm v10+) and only includes files listed in
  each package's `files` field — this is why the apps and `packages/database`
  declare a `files` allowlist (their build output is git-ignored and would
  otherwise be dropped).
- The **api image** bundles a separate Prisma "migrator" deployment and an
  `entrypoint.sh` that runs `prisma migrate deploy` before starting the server;
  `openssl` is installed in the runtime image for the Prisma schema engine.

### Dependency updates

Renovate is configured via [`renovate.json`](renovate.json) at the repo root. It
groups related packages (React/Next.js, Radix UI, Tailwind, ESLint, etc.),
auto-merges patch/minor dev dependency updates, and requires manual review for
production dependencies and major version bumps. Activate it by installing the
[Renovate GitHub App](https://github.com/apps/renovate) on the repository.
