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
- **react-hook-form + zod** for forms
- **`next.config.ts`** sets `typescript.ignoreBuildErrors: true` in both apps

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

Auth is phone-number based. The `AuthContext` (`contexts/auth-context.tsx`) is
currently mock-only: any credentials except password `"000000"` succeed. The
context also stores the user's stickers and listings in memory.

### Admin app (`apps/admin`)

Route structure:

- `/auth` — auth entry point with shared layout (`app/auth/layout.tsx`),
  delegating rendering to `components/auth-layout.tsx`
  - `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`
- `/(dashboard)/...` — all dashboard routes, wrapped in `AuthGuard`

Dashboard sections: overview, posts, users, orders, qr (QR tokens),
administrators, events, notifications, profile.

Auth is email/password, stored in `localStorage` under key `retrouveci_admin`.
The mock credentials are `admin@retrouveci.com` / `admin123`. All data is mock
(`lib/mock-data.ts`); no API backend is connected yet.

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
