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
  client/   # Public-facing app (Next.js, port 3000)
  admin/    # Admin dashboard (Next.js, port 3001)
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

### Next.js apps

Both apps share the same stack:

- **Next.js 16.2** with App Router, React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components imported via `@retrouve-ci/ui/components`
- **`next.config.ts`** sets `typescript.ignoreBuildErrors: true` in both apps

Forms differ per app: `apps/admin` uses **react-hook-form + zod**; `apps/client`
uses **`@conform-to/react` + `@conform-to/zod`** (see client conventions below).

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
  manage cookies/sessions, e.g. `features/auth/lib/phone-auth.client.ts`).
  In `features/auth`, the two endpoints that create/refresh the better-auth
  session cookie (`sign-in/phone-number` via `AuthContext.login`, and
  `phone-number/verify` via `lib/phone-auth.client.ts`) are the only auth calls
  made client-side — the browser needs the `Set-Cookie` response directly, and
  this repo has no server-side mechanism to forward `Set-Cookie` from an API
  response back through a React Router action. Every other auth mutation
  (`send-otp`, `request-password-reset`, `reset-password`) goes through
  `servers/*.action.ts`, using the `intent` field pattern when a route has more
  than one action (e.g. `features/auth/reset-password/servers/reset-password.action.ts`).
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

Route structure:

- `/auth` — auth entry point with shared layout (`app/auth/layout.tsx`),
  delegating rendering to `components/auth-layout.tsx`
  - `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- `/(dashboard)/...` — all dashboard routes, wrapped in `AuthGuard`

Dashboard sections: overview, posts, users, orders, qr (QR tokens),
administrators, events, notifications, contact-messages, profile.

Auth is email/password, stored in `localStorage` under key `retrouveci_admin`.
The mock credentials are `admin@retrouveci.com` / `admin123`. All data is mock
(`lib/mock-data.ts`); no API backend is connected yet, **except**
`/contact-messages`, the first dashboard page wired to the real API
(`apps/api`'s `contact-messages` domain) via `infrastructure/http/api-client.ts`
— see `infrastructure/repositories/api-contact-message-repository.ts` and
`application/contact-messages/use-contact-messages.ts`. Calls go through
`@AllowAnonymous()` (public submission) / `@Roles(['admin'])` (list, detail,
status update) on the API side; since admin auth here is still mock-only
(`localStorage`, not a better-auth session cookie), the admin-only endpoints
will 401 until admin auth is connected to better-auth.

The dashboard layout (`app/(dashboard)/layout.tsx`) renders `<Sidebar>`
alongside `<main className="lg:pl-64">`. The `AuthGuard` component
(`components/auth-guard.tsx`) handles redirect to `/auth/login` when
unauthenticated.

Global shared components live flat in `components/` (sidebar, topbar,
data-table, stats-card, bento-card, etc.). Route-level components are co-located
in each route's own `components/` subfolder.

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
