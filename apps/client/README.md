# RetrouveCI — Client App

The public-facing web application for **RetrouveCI**, a lost-and-found platform for Côte d'Ivoire. Users can post listings for lost or found items, order QR-code stickers that redirect scanners to a contact page, and manage their account. The UI is entirely in French.

Part of the [RetrouveCI monorepo](../../README.md).

## Tech Stack

| Layer | Library / Tool |
| --- | --- |
| Framework | Next.js 16.2 (App Router) |
| Language | TypeScript 5.9 |
| UI | React 19, shadcn/ui (new-york style), Lucide icons |
| Styling | Tailwind CSS v4 (CSS `@theme` directives) |
| Forms | react-hook-form + zod |
| Charts | Recharts |
| Shared components | `@repo/ui` |

## Getting Started

From the **repo root**, run all apps in parallel:

```bash
pnpm dev
```

Or start this app in isolation:

```bash
pnpm --filter client dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

> **Note:** `@repo/ui` must be built before this app can start. Turborepo handles this automatically; if running in isolation, build the package first:

```bash
pnpm --filter @repo/ui build
```

## Routes

| Route | Description |
| --- | --- |
| `/` | Homepage |
| `/annonces` | Browse all listings |
| `/annonces/[id]` | View a single listing |
| `/publier` | Post a listing (choose lost or found) |
| `/publier/perdu` | Post a lost item |
| `/publier/retrouve` | Post a found item |
| `/stickers` | QR sticker information |
| `/stickers/commander` | Order QR stickers |
| `/compte` | User account overview |
| `/compte/annonces` | User's listings |
| `/compte/commandes` | User's orders |
| `/compte/stickers` | User's QR stickers |
| `/compte/parametres` | Account settings |
| `/auth` | Login / register / password reset |
| `/about` | About page |
| `/contact` | Contact page |
| `/download` | App download page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |

## Authentication

Auth is phone-number based and currently **mock-only**. Any credentials except password `"000000"` succeed. The `AuthContext` (`contexts/auth-context.tsx`) stores the user's stickers and listings in memory.

## Project Structure

```text
app/            # Next.js App Router pages and layouts
components/     # App-level components
  ui/           # Local shadcn/ui component library
contexts/       # React context providers (auth, etc.)
hooks/          # Custom React hooks
lib/            # Utilities and helpers
public/         # Static assets
styles/         # Global CSS
```

## Available Scripts

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Lint with ESLint
pnpm check-types  # Type-check with TypeScript
```
