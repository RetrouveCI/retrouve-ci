# RetrouveCI — Admin App

The internal dashboard for **RetrouveCI**, a lost-and-found platform for Côte
d'Ivoire. Administrators can manage listings, users, orders, QR tokens, events,
and notifications.

Part of the [RetrouveCI monorepo](../../README.md).

## Tech Stack

| Layer             | Library / Tool                                     |
| ----------------- | -------------------------------------------------- |
| Framework         | Next.js 16.2 (App Router)                          |
| Language          | TypeScript 5.9                                     |
| UI                | React 19, shadcn/ui (new-york style), Lucide icons |
| Styling           | Tailwind CSS v4 (CSS `@theme` directives)          |
| Forms             | react-hook-form + zod                              |
| Charts            | Recharts                                           |
| Shared components | `@repo/ui`                                         |

## Getting Started

From the **repo root**, run all apps in parallel:

```bash
pnpm dev
```

Or start this app in isolation:

```bash
pnpm --filter admin dev
```

The app will be available at [http://localhost:3001](http://localhost:3001).

> **Note:** `@repo/ui` must be built before this app can start. Turborepo
> handles this automatically; if running in isolation, build the package first:

```bash
pnpm --filter @repo/ui build
```

## Authentication

Auth is email/password based and currently **mock-only**, stored in
`localStorage` under the key `retrouveci_admin`.

| Field    | Value                  |
| -------- | ---------------------- |
| Email    | `admin@retrouveci.com` |
| Password | `admin123`             |

The `AuthGuard` component redirects unauthenticated users to `/admin/login`. All
dashboard data is mocked in `lib/mock-data.ts` — no API backend is connected
yet.

## Routes

| Route                   | Description            |
| ----------------------- | ---------------------- |
| `/admin/login`          | Login page (public)    |
| `/admin`                | Dashboard overview     |
| `/admin/posts`          | Manage listings        |
| `/admin/users`          | Manage users           |
| `/admin/orders`         | Manage orders          |
| `/admin/qr`             | Manage QR tokens       |
| `/admin/administrators` | Manage admin accounts  |
| `/admin/events`         | Manage events          |
| `/admin/notifications`  | Manage notifications   |
| `/admin/profile`        | Admin profile settings |

All dashboard routes are wrapped in `AuthGuard` via the `(dashboard)` route
group layout. The sidebar is rendered at `lg:pl-64` alongside the main content
area.

## Project Structure

```text
app/
  admin/
    login/              # Public login page
    (dashboard)/        # Auth-guarded dashboard routes
      layout.tsx        # Sidebar + AuthGuard wrapper
      page.tsx          # Overview
      posts/
      users/
      orders/
      qr/
      administrators/
      events/
      notifications/
      profile/
components/             # App-level components
  ui/                   # Local shadcn/ui component library
hooks/                  # Custom React hooks
lib/
  mock-data.ts          # All mock data for the dashboard
public/                 # Static assets
styles/                 # Global CSS
```

## Available Scripts

```bash
pnpm dev          # Start dev server on port 3001
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Lint with ESLint
pnpm check-types  # Type-check with TypeScript
```
