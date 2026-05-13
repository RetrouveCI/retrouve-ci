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

| Package                          | Description                                        |
| -------------------------------- | -------------------------------------------------- |
| `@retrouve-ci/ui`                | Shared shadcn/ui component library                 |
| `@retrouve-ci/eslint-config`     | Shared ESLint configs (base, next, react-internal) |
| `@retrouve-ci/typescript-config` | Shared `tsconfig` presets                          |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) 10+

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
pnpm --filter @retrouve-ci/ui build
```

## Tech Stack

All apps share the same core stack:

- **Next.js 16.2** with App Router and React 19
- **TypeScript 5.9**
- **Tailwind CSS v4** — configured via CSS `@theme` directives
- **shadcn/ui** — new-york style, Lucide icons
- **react-hook-form + zod** for forms

## Dependency Updates

This project uses [Renovate](https://docs.renovatebot.com/) to keep dependencies
up to date automatically. Configuration is in [`renovate.json`](renovate.json).

To activate it, install the
[Renovate GitHub App](https://github.com/apps/renovate) on the repository.
Once installed, Renovate will:

- Open a **Dependency Dashboard** issue listing all pending updates
- Create PRs grouped by ecosystem (React, Tailwind, Radix UI, etc.)
- **Auto-merge** patch and minor updates for dev dependencies
- Require manual review for production dependency updates and major versions

## Architecture Notes

- `@retrouve-ci/ui` is consumed directly from source via TypeScript path aliases —
  no build step is required before starting the apps. Turborepo's
  `"dependsOn": ["^build"]` only applies to packages that have a `build` script.
- All shadcn/ui components live in `packages/ui/src/components/ui/` and are
  imported by apps via the `@retrouve-ci/ui/components` barrel export.
- No API backend is connected yet. Both apps run on mock data.
