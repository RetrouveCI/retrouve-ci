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
pnpm --filter @retrouve-ci/ui build  # Must be built before apps can consume it
```

There are no tests configured yet.

## Architecture

### Monorepo layout

```text
apps/
  client/   # Public-facing app (Next.js, port 3000)
  admin/    # Admin dashboard (Next.js, port 3001)
packages/
  ui/                  # Shared component library — compiled to dist/
  tailwind-config/     # Shared Tailwind CSS base styles
  eslint-config/       # Shared ESLint configs (base, next, react-internal)
  typescript-config/   # Shared tsconfig presets
```

### Shared UI package (`packages/ui`)

`@retrouve-ci/ui` is the **single shared shadcn/ui component library** for the
entire monorepo. All shadcn components live in `packages/ui/src/components/ui/`
and are imported by both apps via the `@retrouve-ci/ui/components/ui/*` alias.

**All new components must be added to `packages/ui/src/components/ui/`**, never
inside an app's local directory. To add a component, run the shadcn CLI from the
package:

```bash
cd packages/ui && npx shadcn add <component>
```

Or from an app (both `components.json` files point `ui` → `@retrouve-ci/ui/components/ui`):

```bash
cd apps/client && npx shadcn add <component>
```

The package exports:

- `@retrouve-ci/ui/globals.css` — design tokens + Tailwind base (imported by apps)
- `@retrouve-ci/ui/lib/utils` — the `cn()` helper
- `@retrouve-ci/ui/components/ui/<name>` — individual components

**This package does not need to be built** for apps to consume it — TypeScript
paths in each app's `tsconfig.json` resolve imports directly to `src/`. Turborepo's
`"dependsOn": ["^build"]` applies only when the package has a build step.

### Next.js apps

Both apps share the same stack:

- **Next.js 16.2** with App Router, React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components live in `packages/ui/src/components/ui/`, imported
  via `@retrouve-ci/ui/components/ui/*`
- **react-hook-form + zod** for forms
- **`next.config.ts`** sets `typescript.ignoreBuildErrors: true` in both apps

### Client app (`apps/client`)

Route structure (all under `app/`):

- `/` — homepage
- `/annonces`, `/annonces/[id]` — browse and view listings
- `/publier`, `/publier/perdu`, `/publier/retrouve` — post a listing
- `/stickers`, `/stickers/commander` — QR sticker info and ordering
- `/compte`, `/compte/annonces`, `/compte/commandes`, `/compte/stickers`,
  `/compte/parametres` — user account
- `/auth` — login/register/password reset
- `/about`, `/contact`, `/download`, `/privacy`, `/terms`

Auth is phone-number based. The `AuthContext` (`contexts/auth-context.tsx`) is
currently mock-only: any credentials except password `"000000"` succeed. The
context also stores the user's stickers and listings in memory.

### Admin app (`apps/admin`)

Route structure uses a Next.js route group:

- `/admin/login` — login page (outside the auth guard)
- `/admin/(dashboard)/...` — all dashboard routes, wrapped in `AuthGuard`

Dashboard sections: overview, posts, users, orders, qr (QR tokens),
administrators, events, notifications, profile.

Auth is email/password, stored in `localStorage` under key `retrouveci_admin`.
The mock credentials are `admin@retrouveci.com` / `admin123`. All data is mock
(`lib/mock-data.ts`); no API backend is connected yet.

The dashboard layout (`app/admin/(dashboard)/layout.tsx`) renders `<Sidebar>`
alongside `<main className="lg:pl-64">`. The `AuthGuard` component handles
redirect to `/admin/login` when unauthenticated.

### Styling

Tailwind CSS v4 is used throughout with no JS config file — everything is
configured via CSS `@theme` directives. The design token source of truth is
`packages/ui/globals.css` (RetrouveCI brand colors, shadcn CSS variables,
animations, utilities). Each app's `app/globals.css` imports it:

```css
@import '@retrouve-ci/ui/globals.css';
@source '../../../packages/ui/src';
```

The `@source` directive tells Tailwind to scan the shared package's source files
so component class names are included in the generated CSS. No `ui-` prefix is
used — all Tailwind classes are standard. Apps can add app-specific overrides
after the import in their own `app/globals.css`.
