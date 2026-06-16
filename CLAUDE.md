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
pnpm dev              # Start all apps in parallel (client :3000, admin :3001)
pnpm build            # Build all packages and apps (packages build first)
pnpm lint             # Lint all workspaces
pnpm check-types      # Type-check all workspaces
pnpm format           # Format with Prettier (ts, tsx, md)
```

To run a single app or package in isolation:

```bash
pnpm --filter client dev
pnpm --filter admin dev
pnpm --filter @retrouve-ci/ui build
```

There are no tests configured yet.

## Architecture

### Monorepo layout

```text
apps/
  client/   # Public-facing app (React Router v7 / Vite, port 3000)
  admin/    # Admin dashboard (React Router v7 / Vite, port 3001)
  api/      # Backend REST API (NestJS, port 3333)
packages/
  ui/                  # Shared component library (source-only, no build step)
  eslint-config/       # Shared ESLint configs (base, next, react-internal)
  typescript-config/   # Shared tsconfig presets
```

### Shared UI package (`packages/ui`)

`@retrouve-ci/ui` is the **single shared shadcn/ui component library** for the
entire monorepo. All shadcn components live in `packages/ui/src/components/ui/`
and are consumed by both apps through the package's barrel exports.

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

- `@retrouve-ci/ui/styles` — design tokens + Tailwind base (imported by apps)
- `@retrouve-ci/ui/utils` — the `cn()` helper
- `@retrouve-ci/ui/components` — all UI components (barrel export)
- `@retrouve-ci/ui/hooks` — shared hooks

**This package does not need to be built** for apps to consume it — TypeScript
paths in each app's `tsconfig.json` resolve imports directly to `src/`.
Turborepo's `"dependsOn": ["^build"]` applies only when the package has a build
script.

### Frontend apps (React Router v7)

Both apps share the same stack:

- **React Router v7** (Vite, SSR) with React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components imported via `@retrouve-ci/ui/components`
- **`@conform-to/react` + `@conform-to/zod`** for all forms in both apps

Both use the same feature-based architecture under `app/features/[feature]/`
with `servers/*.loader.ts` / `servers/*.action.ts` for all server-side data
access (see conventions below).

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

Auth is phone-number based via better-auth (`phoneNumberClient` plugin).
`AuthContext` (`app/shared/auth/auth-context.tsx`) wraps
`authClient.useSession()` for client-side session state (`user`,
`isAuthenticated`, `login`, `logout`). Server-side,
`app/shared/auth/auth.server.ts` exposes `getServerSession` /
`requireServerSession`, which forward the request's `Cookie` header to
`/api/auth/get-session` — used by route loaders to gate server data fetches.

#### Client app conventions (loader/action + Conform/Zod)

- UI components never call `apiFetch` or `authClient` directly — all API access
  goes through a feature's `servers/*.loader.ts` / `servers/*.action.ts`
  (server-side) or a dedicated `lib/*.client.ts` wrapper (client-side calls that
  manage cookies/sessions, e.g. `features/auth/lib/phone-auth.client.ts`). In
  `features/auth`, the two endpoints that create/refresh the better-auth session
  cookie (`sign-in/phone-number` via `AuthContext.login`, and
  `phone-number/verify` via `lib/phone-auth.client.ts`) are the only auth calls
  made client-side — the browser needs the `Set-Cookie` response directly, and
  this repo has no server-side mechanism to forward `Set-Cookie` from an API
  response back through a React Router action. Every other auth mutation
  (`send-otp`, `request-password-reset`, `reset-password`) goes through
  `servers/*.action.ts`, using the `intent` field pattern when a route has more
  than one action (e.g.
  `features/auth/reset-password/servers/reset-password.action.ts`).
- Every form uses `@conform-to/react` + `@conform-to/zod` (`useForm`,
  `useInputControl`, `getFormProps`, `getZodConstraint`, `parseWithZod`) — no
  hand-rolled `useState` validation.
- Each route feature owns its own Zod schema as a sibling `*.schema.ts` file
  (e.g. `features/auth/login/login.schema.ts`,
  `features/account/settings/settings.schema.ts`). Small schemas may be
  duplicated across features rather than shared, to keep each feature
  self-contained.
- Route `index.tsx` files stay thin: page-level state (current step, layout,
  redirects) only. Per-section/per-step form logic is extracted into components
  under that feature's own `components/` folder (e.g.
  `features/auth/register/components/otp-step-section.tsx`,
  `features/account/settings/components/security-section.tsx`). Cross-feature UI
  primitives (e.g. `features/auth/components/`) stay separate from these
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
`shared/auth/auth.server.ts`), which forwards the `Cookie` header to
`/api/auth/get-session` and throws `redirect('/auth/login')` if no valid admin
session is found.

#### Admin app conventions

Identical to the client app conventions above, with these admin-specific notes:

- `shared/auth/auth-client.ts` uses better-auth's `adminClient()` plugin for
  admin-only operations. `shared/auth/auth.server.ts` provides
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
- The `shared/components/topbar.tsx` fetches the unread notification count on
  mount via `apiFetch('/notifications/unread-count')` with
  `credentials: 'include'` (client-side, since the topbar is part of the
  dashboard layout and not owned by the notifications feature).

### Styling

Tailwind CSS v4 is used throughout with no JS config file — everything is
configured via CSS `@theme` directives. The design token source of truth is
`packages/ui/src/styles/globals.css` (RetrouveCI brand colors, shadcn CSS
variables, animations, utilities). Each app's `app/globals.css` imports it:

```css
@import '@retrouve-ci/ui/styles';
@source '../../../packages/ui/src';
```

The `@source` directive tells Tailwind to scan the shared package's source files
so component class names are included in the generated CSS. No `ui-` prefix is
used — all Tailwind classes are standard. Apps can add app-specific overrides
after the import in their own `app/globals.css`.

### Dependency updates

Renovate is configured via [`renovate.json`](renovate.json) at the repo root. It
groups related packages (React/Next.js, Radix UI, Tailwind, ESLint, etc.),
auto-merges patch/minor dev dependency updates, and requires manual review for
production dependencies and major version bumps. Activate it by installing the
[Renovate GitHub App](https://github.com/apps/renovate) on the repository.
