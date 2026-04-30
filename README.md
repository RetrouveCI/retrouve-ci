# RetrouveCI

**RetrouveCI** is a lost-and-found platform for Côte d'Ivoire. Users can post
listings for lost or found items and order QR-code stickers that, when scanned,
redirect finders to a contact page. The UI is entirely in French.

This repository is a [Turborepo](https://turbo.build/repo) monorepo containing
two Next.js applications and a set of shared packages.

## Apps

| App                             | Port | Description              |
| ------------------------------- | ---- | ------------------------ |
| [client](apps/client/README.md) | 3000 | Public-facing web app    |
| [admin](apps/admin/README.md)   | 3001 | Internal admin dashboard |

## Packages

| Package                   | Description                                           |
| ------------------------- | ----------------------------------------------------- |
| `@repo/ui`                | Shared React component library — compiled to `dist/`  |
| `@repo/tailwind-config`   | Shared Tailwind CSS base styles (`@theme` directives) |
| `@repo/eslint-config`     | Shared ESLint configs (base, next, react-internal)    |
| `@repo/typescript-config` | Shared `tsconfig` presets                             |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 9+

## Getting Started

```bash
# Install all dependencies
pnpm install

# Start all apps in development mode (client :3000, admin :3001)
pnpm dev
```

## Commands

All commands are run from the repo root.

```bash
pnpm dev          # Start all apps in parallel
pnpm build        # Build all packages and apps (packages build first)
pnpm lint         # Lint all workspaces
pnpm check-types  # Type-check all workspaces
pnpm format       # Format with Prettier (ts, tsx, md)
```

To run a single app or package in isolation:

```bash
pnpm --filter client dev
pnpm --filter admin dev
pnpm --filter @repo/ui build
```

## Tech Stack

All apps share the same core stack:

- **Next.js 16.2** with App Router and React 19
- **TypeScript 5.9**
- **Tailwind CSS v4** — configured via CSS `@theme` directives
- **shadcn/ui** — new-york style, Lucide icons
- **react-hook-form + zod** for forms

## Architecture Notes

- `@repo/ui` **must be built** before the apps can start. Turborepo handles this
  automatically via `"dependsOn": ["^build"]` in `turbo.json`. If running an app
  in isolation, build `@repo/ui` first.
- Each app maintains its own local shadcn/ui component library under
  `components/ui/`. These are not shared between apps.
- The `@repo/ui` package uses a `ui-` class prefix to prevent Tailwind class
  conflicts with app-level styles.
- No API backend is connected yet. Both apps run on mock data.
