# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**RetrouveCI** is a lost-and-found platform for Côte d'Ivoire. Users can post listings for lost/found items and use QR-code stickers that, when scanned, redirect to a contact page. The UI is entirely in French.

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
pnpm --filter @repo/ui build  # Must be built before apps can consume it
```

There are no tests configured yet.

## Architecture

### Monorepo layout

```
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

`@repo/ui` compiles TypeScript to `dist/` and exports CSS as `@repo/ui/styles.css`. It currently contains only a few stub components (Card, Gradient, TurborepoLogo). **This package must be built before the apps**, which Turborepo handles automatically via `"dependsOn": ["^build"]` in `turbo.json`.

In contrast, **each app maintains its own full shadcn/ui component library** under `components/ui/`. These are not shared and are installed directly into each app via the shadcn CLI. Both apps use the "new-york" style with neutral base color and Lucide icons.

### Next.js apps

Both apps share the same stack:

- **Next.js 16.2** with App Router, React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config file
- **shadcn/ui** — components live in `components/ui/`, aliases configured in `components.json`
- **react-hook-form + zod** for forms
- **`next.config.ts`** sets `typescript.ignoreBuildErrors: true` in both apps

### Client app (`apps/client`)

Route structure (all under `app/`):

- `/` — homepage
- `/annonces`, `/annonces/[id]` — browse and view listings
- `/publier`, `/publier/perdu`, `/publier/retrouve` — post a listing
- `/stickers`, `/stickers/commander` — QR sticker info and ordering
- `/compte`, `/compte/annonces`, `/compte/commandes`, `/compte/stickers`, `/compte/parametres` — user account
- `/auth` — login/register/password reset
- `/about`, `/contact`, `/download`, `/privacy`, `/terms`

Auth is phone-number based. The `AuthContext` (`contexts/auth-context.tsx`) is currently mock-only: any credentials except password `"000000"` succeed. The context also stores the user's stickers and listings in memory.

### Admin app (`apps/admin`)

Route structure uses a Next.js route group:

- `/admin/login` — login page (outside the auth guard)
- `/admin/(dashboard)/...` — all dashboard routes, wrapped in `AuthGuard`

Dashboard sections: overview, posts, users, orders, qr (QR tokens), administrators, events, notifications, profile.

Auth is email/password, stored in `localStorage` under key `retrouveci_admin`. The mock credentials are `admin@retrouveci.com` / `admin123`. All data is mock (`lib/mock-data.ts`); no API backend is connected yet.

The dashboard layout (`app/admin/(dashboard)/layout.tsx`) renders `<Sidebar>` alongside `<main className="lg:pl-64">`. The `AuthGuard` component handles redirect to `/admin/login` when unauthenticated.

### Styling

Tailwind CSS v4 is used throughout. Shared base styles live in `packages/tailwind-config/shared-styles.css` using `@theme` directives. Each app has its own `app/globals.css` with CSS variables for design tokens (light/dark mode). The `@repo/ui` package uses a `ui-` class prefix to avoid conflicts with app-level Tailwind classes.
