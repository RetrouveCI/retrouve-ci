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
pnpm test             # Run unit tests (Vitest — api and admin)
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

Tests are run with **Vitest**. The `api` app uses `*.spec.ts` (node). Both
front-ends declare two Vitest **projects**: `node` for `__tests__/*.test.ts`
(pure modules) and `ui` for `__tests__/*.test.tsx`, run in a real Chromium
through browser mode. Both apps have suites for both projects.

```bash
pnpm --filter @app/api test        # api only
pnpm --filter @app/admin test      # both projects
pnpm --filter @app/admin test:ui   # browser-mode components/hooks only
```

## Architecture

### Monorepo layout

```text
apps/
  client/   # Public-facing app (React Router v7 / Vite, port 3000)
  admin/    # Admin dashboard (React Router v7 / Vite, port 3001)
  api/      # Backend REST API (NestJS / Fastify, port 3002)
packages/
  auth/                # Shared better-auth core, framework-agnostic (@app/auth)
  contracts/           # Zod schemas shared by the API and both fronts (@app/contracts)
  database/            # Prisma schema, migrations & generated client (@app/database)
  ui/                  # Shared component library (source-only, no build step)
  web-kit/             # Front code shared client <-> admin (source-only, @app/web-kit)
  eslint-config/       # Shared ESLint configs (base, react-internal)
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

### Front kit package (`packages/web-kit`)

`@app/web-kit` holds the code the two front-ends **genuinely** share. It is
source-only like `@app/ui` — no build step, `exports` point straight at `src/`,
and each app's Vite compiles it. Imported by sub-path only: `@app/web-kit/api`,
`@app/web-kit/action`.

`action/` is the E7 foundation — `ActionResult`, `zodErrorToFieldErrors`,
`rootError`, `withApiOperationData` / `withApiOperationError`,
`useActionFetcher`. Those four files were **byte-identical** in both apps, so
every form in the monorepo depended on two copies staying in step.

`api/` holds `ApiError` and `createApiFetch()`. It is a factory rather than a
plain function because the two apps address different audiences on one API: the
backoffice sends `X-Auth-Audience: admin` on every call, and that header was the
_only_ difference between the two former `apiFetch` implementations. Both halves
of that rule are asserted — the backoffice's spec checks the header is sent, the
client's checks it is absent, since the public app claiming the admin audience
is what `SessionGuard` exists to prevent.

Each app keeps a one-line re-export at its old `@/shared/...` path, so the 65
files importing these modules were untouched. New code may import
`@app/web-kit/action` directly.

What deliberately stays per-app: `auth-client.ts` (different better-auth
plugins), `session.server.ts` / `redirect.ts` / `page-meta.ts` (same idea,
genuinely different code), `helpers/testing.ts` (two `export *` lines over the
test runner, not worth dragging `vitest/browser` into the package) and
`utils/phone.ts` (already a re-export of `@app/contracts/shared`). See
[packages/web-kit/README.md](packages/web-kit/README.md).

### Auth package (`packages/auth`)

`@app/auth` owns the **shared better-auth core** as a framework-agnostic
factory: `createAuth(prisma, { appName, basePath, plugins, trustedOrigins })`.
It holds no NestJS glue — wiring it into a composition root is the app's job
(`apps/api/src/infrastructures/auth/`).

The split follows the data model: because one database backs every instance, the
package owns the Prisma adapter, the extra user fields (`city`, `commune`),
email/password sign-in, user deletion and the `admin()` plugin that defines the
roles. It also owns the **password rule as the server enforces it**, reading
`@app/contracts/shared`: `minPasswordLength` / `maxPasswordLength` come from
`PASSWORD_MIN_LENGTH` / `PASSWORD_MAX_LENGTH` (better-auth's own default is
already 8 — this repo used to lower it to 6), and a `hooks.before` middleware
applies `passwordSchema` to `/admin/create-user`, the **one** password write
better-auth does not bound itself. Every other path — sign-up, both
reset-password flows, change-password, set-password, admin set-user-password —
checks the length on its own. Neither sign-in route bounds the password it
receives, so raising the floor locks no existing account out. An instance
decides only its own identity — `appName` (which better-auth turns into the
session cookie prefix), `basePath`, and the plugins its audience needs.
`apps/api` adds `phoneNumber()` for the public app.

That parameterisation is what makes two instances possible later: two `appName`s
mean two independent cookies. See
[packages/auth/README.md](packages/auth/README.md).

Like `database`, this package **has a build step** and the api resolves it
through `dist`, so it builds first via Turborepo's `^build`. Its `exports` point
`types` at `src` and `require` at `dist`, so type-checking a consumer needs no
build.

It is **server-side only**: `Session` describes the shared core and so carries
no `phoneNumber` (those columns come from the app-supplied plugin), and the
front-ends read `/api/auth/get-session` over JSON where dates are strings. Each
front keeps its own interface for that response.

### Contracts package (`packages/contracts`)

`@app/contracts` is the **single source of truth for every Zod schema shared
between the API and a front-end**. It is imported **by sub-path only** —
`@app/contracts/shared`, `@app/contracts/lost-items` — because its `exports`
uses a `"./*"` pattern; there is no root barrel, by design.

Like `database` and `auth` it **has a build step**: `apps/api` resolves it
through `dist` (CJS, the `require` condition) so it builds first via Turborepo's
`^build`, while the two front-ends resolve `src` directly (`types` and `import`
both point there), so type-checking a consumer needs no build. Specs are
excluded from `tsconfig.build.json` and never ship in `dist`.

Two rules hold for every schema added here:

- export **both** `z.input` and `z.output` as `XxxInput` / `XxxData`, since a
  form types its fields on the input and its submit handler on the output;
- never `z.coerce`, whose `z.input` is `unknown` in Zod 4 — which makes the
  exported `Input` type useless and untypable by react-hook-form. Accept
  `z.union([z.number(), z.string().transform(Number)])` instead, and give the
  union its own `error`, or it reports `Invalid input` in English.

E6 landed the business schemas, one domain per PR, and is **closed**:
`shared/pagination.ts`, `shared/phone.ts`, `shared/calendar-date.ts`,
`shared/password.ts`, `shared/otp.ts`, `contact-messages/`, `events/`,
`notifications/`, `sticker-orders/`, `qr-codes/`, `lost-items/` and `auth/`.
`MAX_PAGE_SIZE` lives here now, and a migrated domain no longer keeps a copy of
it.

`shared/password.ts` owns the **password rule** — `8..128` plus an uppercase, a
lowercase and a digit — and was the worst drift E6 found: one `user.password`
column governed by **five** rules at once (the API's `min 6`, the two fronts'
`min 6` with and without a ceiling, the backoffice's `min 8` + complexity, and
administrator creation at `min 6` with no complexity). Because an admin is also
an ordinary user, the public app could reset a backoffice account to six
characters. It also owns `withPasswordConfirmation`, which replaces the
`newPassword === confirmPassword` refinement copied into five schemas, and
`currentPasswordSchema` — a **login** field checks presence only, since an
account may predate the rule. `PASSWORD_HINT` and `PASSWORD_PLACEHOLDER` live
here too, so no form can advertise a rule the schema does not enforce.

`shared/otp.ts` owns `OTP_LENGTH`. better-auth's `phoneNumber()` plugin defaults
to `otpLength: 6` and the API never overrides it, so the phone-change form's
`/^\d{4,8}$/` accepted a four-digit code the API could only ever reject.

`shared/phone.ts` owns the **Côte d'Ivoire phone rule** — `225` plus exactly ten
digits, spacing and the `+225` form accepted — and is the single home for what
was written three times: once in each front's `shared/utils/phone.ts` and once
inside `infrastructures/sms/letexto.service.ts`. Both fronts' copies are now
re-exports, so the twelve files that import `@/shared/utils/phone` are
untouched, and `toLetextoRecipient` keeps only what is gateway-specific: its
`InvalidRecipientError` and the `+`-less `225XXXXXXXXXX` the API addresses.

`sticker-orders/` is the first entry to carry **business data**, not only
validation rules: the pack catalogue (id, name, quantity, price), the delivery
fee and the free-delivery coupons. Each was written twice — once for the API,
once for the order page — so a price change could land on one side only.
`STICKER_PACKS_BY_ID` is keyed by pack id, which makes
`domains/sticker-orders/helpers/get-sticker-pack.ts` a total function and
removes the non-null assertion its validator used to justify. A front keeps only
what is genuinely presentational: `stickers-order.const.ts` holds the sales copy
(`description`, `popular`, `features`) and composes it onto the contract's
packs.

A query string carries everything as a string, so a filter that is not a string
needs the same union `paginationQuerySchema` uses for its numbers:
`notifications/list-filter.schema.ts` reads `read` as
`z.union([z.boolean(), z.enum(['true', 'false']).transform(…)])`. Keep that
union local to the file that needs it, as `countable` is, until a second domain
wants it.

`shared/calendar-date.ts` owns the **date rule**, which deliberately does
**not** use `z.iso.datetime()`: a form posts what its input produces —
`datetime-local` gives `2026-09-01T18:30`, `date` gives `2026-09-01` — and
neither carries the seconds and the offset that helper demands. It accepts both
ISO shapes and rebuilds the day to refuse the 31 February `Date.parse` would
silently roll over. `calendarDateSchema({ required, invalid })` is a factory
because each caller names its own field: `events/` and `lost-items/` say
`La date est requise`, and `lost-items/list-filter.schema.ts` names the boundary
it refuses (`Date de début invalide`).

`lost-items/` is the largest entry and the one that closed the **last** phone
drift: `contactWhatsappSchema` refines on `isValidLocalNumber` and transforms
with `toE164`, so the number is normalised **once**, server-side. The client
used to prefix `+225` unconditionally onto a field its own regex let through at
8 to 16 digits, so a poster who typed `2250700000000` was stored as
`+2252250700000000` and could not be reached. `updateLostItemSchema` omits
`type` and `category` before `.partial()`: they are set at publication, and the
pipe now strips an attempt to rewrite them. Both fronts keep only their labels —
`publish.const.ts`'s `OBJECT_TYPES` and the backoffice's `posts.const.ts` are
`Record<LostItemCategory, …>` tables composed onto the contract's values, so a
new category is a type error rather than a missing label.

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
  <domain>/         # use-cases, repository, mappers, helpers, errors, types
                    # + <domain>-domain.module.ts
infrastructures/  # Framework/IO wiring: database, auth, queue (BullMQ), sms,
                  # storage, seeder
presentations/    # HTTP layer: controllers + queue-consumers, one folder per
                  # domain
shared/           # Cross-cutting: errors, filters, pipes, guards, swagger,
                  # utils (pagination)
```

These are the **four** folders `src/` holds — E8.1 pluralised the two middle
ones and absorbed the stray `libs/storage/cloudinary.ts` into
`infrastructures/storage/cloudinary.client.ts`.

- Domains: `contact-messages`, `events`, `lost-items`, `matching`,
  `notifications`, `qr-codes`, `reporting`, `sticker-orders`. Each keeps its
  use-cases free of NestJS/HTTP concerns; controllers in `presentations/` are
  thin and delegate to use-cases.
- Auth is **better-auth** (`@thallesp/nestjs-better-auth`): phone-number based
  for the client, email/password + admin role for the admin app.
- **Phone OTPs go out over SMS through Letexto, on their own BullMQ queue.**
  better-auth's `phoneNumber()` plugin still owns the code itself — it generates
  it, stores it and verifies it, so there is no parallel OTP store; the app only
  sets `expiresIn` (`OTP_TTL_SECONDS`, **120 s**), the code's length (six, the
  plugin's own default, named `OTP_LENGTH` in `@app/contracts/shared`) and
  `phoneNumberValidator`, which is `isValidLocalNumber` — without it a malformed
  number only failed at delivery, after `OtpConsumer` had burnt its three BullMQ
  attempts. `sendOTP` / `sendPasswordResetOTP` enqueue on the `otp` queue via
  `OtpDispatcher` (`infrastructures/auth/`); `OtpConsumer`
  (`presentations/auth/queue-consumers/`) builds the message and calls
  `LetextoService` (`infrastructures/sms/`). Jobs retry three times with an
  exponential backoff and are removed on both success **and** failure, since
  each carries a live code; the failure log names the recipient, never the code.
  The recipient is normalised to `225` + **exactly 10 digits**, which is what
  the gateway addresses: E.164 (what better-auth stores), a bare local number
  and either of them spaced are all accepted, and anything else raises
  `InvalidRecipientError`, which the consumer turns into BullMQ's
  `UnrecoverableError` — a number that will never be valid must not burn the
  retries a transient failure needs. The same rule is enforced on every phone
  field of both front-ends and by `qr-codes/contact-owner.schema.ts`, all of
  them reading `@app/contracts/shared`'s `isValidLocalNumber` — the admin's
  optional administrator phone included, since it shares the `user.phoneNumber`
  column the public app sends codes to. Templates live in
  `shared/auth/otp-message.ts` and are deliberately **unaccented** — one accent
  switches the SMS from GSM-7 to UCS-2 and halves the segment from 160
  characters to 70 — and are asserted against a 150-char ceiling by their spec.
  `LETEXTO_API_URL`, `LETEXTO_API_KEY` and `LETEXTO_API_SENDER` are **required
  in production**: the API refuses to start without them, because a sign-in that
  cannot deliver its code is worse than a boot failure. Left unset in
  development, the code is logged to the console as it was before there was a
  gateway.
- Background jobs (e.g. match notifications, OTP SMS) run on **BullMQ** backed
  by Redis. Every queue shares one connection, built by
  `infrastructures/queue/queue.config.ts`. `REDIS_URL` is **required in
  production**: BullMQ's own fallback is `localhost:6379`, so an unset variable
  let the API boot perfectly healthy while every OTP and match job piled up in a
  queue no worker would ever read. Outside production it falls back to that same
  localhost address, explicitly.
- A startup **seeder** creates the super admin and a mock user from env vars
  when absent.
- **Validation is Zod contracts, everywhere** (E6, closed). An endpoint applies
  `shared/pipes/zod-validation.pipe.ts` to a schema from
  `@app/contracts/<domain>`, which validates **and transforms** — a `.trim()` in
  the contract reaches the use-case, which a DTO never did — and answers
  `400 { message: 'Validation failed', errors: { <field>: [...] } }`. Every
  message must be French: a bare `z.enum` or `z.union` reports its default in
  English, so both need an explicit `error`, and so does a bare `z.string()`
  whose field may be **absent** — the type error fires before `.min()`, which is
  why `passwordSchema` names its own. Note the behaviour change the pipe brings:
  a body field the schema does not know is **stripped**, where the old
  `forbidNonWhitelisted` answered 400. There are **no `*.dto.ts` files and no
  `class-validator` importers left**, no `domains/*/validators/` folder, and the
  global `ValidationPipe` is gone — every `@Body`/`@Query` in `presentations/`
  carries its own pipe (a `@Param` is a plain string and needs none). Because
  `@ApiProperty` left with the DTOs, `shared/swagger/api-zod.decorator.ts`
  derives the OpenAPI schema from the contract itself through Zod 4's
  `z.toJSONSchema` (`@ApiZodBody`, `@ApiZodQuery`) — no new dependency, and
  `/docs` cannot drift from what the pipe enforces. Domain errors are translated
  to HTTP responses by `DomainExceptionFilter`. **Known debt**: a body field
  that is simply _missing_ still answers in English on the six domains migrated
  before `auth`, since their schemas do not name a message for the type error.
  `z.config(z.locales.fr())` would fix all of them at once, but the zod instance
  is shared with better-auth, whose own messages would turn French too — an open
  decision, not an oversight.
- `apps/api` reads `@app/contracts` through its **`dist`**, so a contract change
  needs `pnpm --filter @app/contracts build` before `nest start` picks it up.
  `pnpm build` and `pnpm test` handle it via Turborepo's `^build`.
- Tests are **Vitest** and live in a `__tests__/` folder next to the file under
  test (`use-cases/__tests__/create-x.use-case.spec.ts`), the same convention
  the two front-ends use. Shared data builders go in a `*.fixture.ts`, which
  `tsconfig.build.json` excludes alongside the specs. `contact-messages` follows
  this; the other domains still colocate and move as they are migrated.

A domain migrated by E8 has a definite shape — `contact-messages` is the pilot:

- **one file per use-case**, each an `@Injectable()` class implementing
  `IDomainUseCase<TInput, TOutput>` from `shared/types/domain-use-case.type.ts`
  with a single public `execute`. A use-case **never** calls another one: the
  existence check two of them share lives in `helpers/require-<entity>.ts`.
- **the repository is one concrete class**, `repository/<entity>.repository.ts`,
  injected by its type. No interface file, no `Symbol` token, no `.service.ts`
  suffix — the file in `repository/` _is_ the repository.
- **`<domain>-domain.module.ts`** provides and exports the repository and every
  use-case, so a presentation module declares only its controller and imports
  the domain module. A second domain needing a use-case imports that domain
  module, never the other presentation module.
- **no `models/` folder**: the entity type lives in `types/`, and a paginated
  response is `Paginated<T>` from `shared/utils/pagination.util.ts`.

For where new code belongs (domains vs presentations vs infrastructures), use
the `backend-conventions` skill (`.claude/skills/backend-conventions/`). The
layer **names** now match the target layout; what E8 still owes is their
_contents_ — one use-case per file, a `<domain>-domain.module.ts` per domain,
and `models/` folded into `types/`. See
[MIGRATION-PLAN-API.md](MIGRATION-PLAN-API.md) §4.

### Frontend apps (React Router v7)

Both apps share the same stack:

- **React Router v7** (Vite, SSR) with React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components imported via `@app/ui/components`
- **Forms are react-hook-form + zod** everywhere, in both apps and in
  `packages/ui` (E7 of [MIGRATION-PLAN.md](MIGRATION-PLAN.md), closed). The
  `@conform-to/*` packages are gone from the catalog, including on the stand-by
  routes whose entries are commented out of `routes.ts`.
- The admin dialogs use `FormInputField` / `FormTextareaField` from
  `@app/ui/components/form` — `Controller` + the shadcn `Field` family,
  factored, since their fields are uniform. Bespoke fields (an icon inside the
  input, a visibility toggle) inline `Controller` + `Field` instead, as
  `routes/auth` does.

Both apps use the same layout, `app/routes/<area>/<page>/`, with
`servers/*.loader.ts` / `servers/*.action.ts` for all server-side data access
(see conventions below, and the `frontend-conventions` skill).

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
> share (see `routes/publish/`, `routes/auth/`).
>
> A route whose entry is commented out of `routes.ts` gets **no `+types/`
> module** — React Router only generates them for mounted routes — so it must
> spell its loader/action args out (`({ request }: { request: Request })`),
> which is what every action in the repo does anyway. That is what keeps
> `stickers/**` and `q/**` inside `typecheck`, the only gate that covers them
> since `build` never bundles them. `account/orders/**` and
> `account/stickers/_index.tsx` are still excluded in
> `apps/client/tsconfig.json` for exactly that missing module.

Auth is phone-number based via better-auth (`phoneNumberClient` plugin).
`AuthContext` (`app/context/auth.tsx`) wraps `authClient.useSession()` for
client-side session state (`user`, `isAuthenticated`, `login`, `logout`).
Server-side, `app/shared/helpers/session.server.ts` exposes `getServerSession` /
`requireServerSession`, which forward the request's `Cookie` header to
`/api/auth/get-session` — used by route loaders to gate server data fetches.

> **The two apps hold separate sessions.** The API runs **two** better-auth
> instances, both built by `@app/auth` from the same database:
>
> | Instance | Base path         | Cookie                           | Extra plugin    |
> | -------- | ----------------- | -------------------------------- | --------------- |
> | public   | `/api/auth`       | `better-auth.session_token`      | `phoneNumber()` |
> | admin    | `/api/admin-auth` | `retrouveci-admin.session_token` | —               |
>
> So one browser can be signed in to the backoffice and to the public app at the
> same time, as two different sessions. An admin is also an ordinary user here,
> and signing in on one app no longer replaces the other's session.
>
> Two cookies are **not** isolation on their own — the browser sends both to the
> API. `shared/auth/guards/session.guard.ts`, registered as the app's global
> guard, is what decides **which** instance to read: the request's `Origin` when
> there is one (a page can neither forge nor remove it, so an injected script
> cannot claim the other audience), otherwise the `X-Auth-Audience` header,
> which only server-side calls need since they carry no `Origin` —
> `apps/admin`'s `apiFetch` sends it on every call. The chosen instance is the
> only one consulted; there is no fallback to the other, which is the whole
> point.
>
> That guard replaces the one `@thallesp/nestjs-better-auth` registers (both
> registrations pass `disableGlobalAuthGuard: true`) and honours the same
> decorators: `@AllowAnonymous()`, `@OptionalAuth()`, `@Roles([...])`. It
> attaches `request.session` and `request.user`, so `@Session()` keeps working.
> The admin instance is registered with `isGlobal: false`, because the package
> binds its options to a single injection token and a second global registration
> would take over `AuthService`.
>
> `ADMIN_ORIGINS` (CSV) lists the backoffice's origins and is **required in
> production**: without it the API cannot tell the two apps apart, and refuses
> to start.
>
> **Every backoffice call goes to `/api/admin-auth`, never `/api/auth`.**
> Because the shared core carries the `admin()` plugin, both instances expose
> `/admin/list-users` and friends, so a call to the wrong base path does not 404
> — it validates against the other app's cookie and answers 401. These routes
> are mounted as middleware before Nest, so `SessionGuard` never catches the
> mistake. The email password-reset flow is the backoffice's alone (the public
> app resets by phone OTP), so it lives there too.
>
> `ADMIN_APP_URL` is the backoffice's **public** origin, read at runtime by
> `shared/helpers/redirect.ts`'s `appUrl()`. The reset link better-auth emails
> resolves a relative `redirectTo` against `BETTER_AUTH_URL` — the API's own
> origin, where nothing serves that page — so the link must be absolute. Unset,
> `appUrl()` falls back to the request's origin, which is right in development
> and behind no proxy.

#### Client app conventions (loader/action + Zod)

- UI components never call `apiFetch` or `authClient` directly — all API access
  goes through a feature's `servers/*.loader.ts` / `servers/*.action.ts`
  (server-side) or a dedicated `helpers/*.client.ts` wrapper (client-side calls
  that manage cookies/sessions, e.g.
  `routes/auth/helpers/phone-auth.client.ts`), or — when the data is wanted
  lazily rather than per navigation — a **resource route** `fetcher.load`ed by a
  hook: `routes.ts` points a path straight at a `servers/*.loader.ts` with no
  component (`publish/matches`, `account/activity`). That is what
  `components/activity-hub.tsx` uses: the floating panel's summary would cost a
  session round-trip on every navigation from the root loader, for anonymous
  visitors included, whereas its hook loads once per full page load and again on
  each open. In `routes/auth`, the two endpoints that create/refresh the
  better-auth session cookie (`sign-in/phone-number` via `AuthContext.login`,
  and `phone-number/verify` via `lib/phone-auth.client.ts`) are the only auth
  calls made client-side — the browser needs the `Set-Cookie` response directly,
  and this repo has no server-side mechanism to forward `Set-Cookie` from an API
  response back through a React Router action. Every other auth mutation
  (`send-otp`, `request-password-reset`, `reset-password`) goes through
  `servers/*.action.ts`, using the `intent` field pattern when a route has more
  than one action (e.g.
  `routes/auth/reset-password/servers/reset-password.action.ts`).
- Every form is schema-driven — no hand-rolled `useState` validation. New and
  migrated forms use **react-hook-form**: `useForm` with
  `standardSchemaResolver(schema)` from `@hookform/resolvers/standard-schema`,
  plus `Controller` (or `useController`, when one component takes several fields
  as a flat prop contract). `FormInputField` / `FormTextareaField` from
  `@app/ui/components/form` wrap the common single-input case; a form whose
  markup is bespoke (raw `<input>`s with their own classes, as in
  `routes/contact` and `routes/q`) inlines `Controller` instead, so migrating it
  leaves the DOM untouched.
- Actions answer a single contract, `ActionResult` from `@app/web-kit/action`
  (re-exported at `shared/types/action.ts`): `{ success: true }` or
  `{ success: false, errors? }`, where `errors` is already shaped as
  react-hook-form `FieldErrors` — one entry per field, plus `root` for anything
  that belongs to no field. Two helpers build it: `zodErrorToFieldErrors` turns
  a failed `safeParse` into that map, and `withApiOperationError` wraps the API
  call — it returns `{ success: true }`, turns an `ApiError` into a `root`
  error, and rethrows anything else. Pass it `redirectOnUnauthorized` to convert
  a 401 into a `redirect()` instead of a form error.
- Forms consume that result through `useActionFetcher`
  (`{ data, isOk, errors, isSubmitting, submit, Form, state }`) and hand
  `fetcher.errors` straight to `useForm`'s `errors:` option, so server-side
  messages land on the fields they belong to. Render `root` with `FormRootError`
  from `@app/ui/components/form`. Success side effects (a toast, a navigation,
  closing a dialog) go in a `useEffect` guarded on `fetcher.isOk` — plus a
  `hasSubmitted` flag whenever the effect does something that must not be
  replayed, since `isOk` stays true afterwards. `useActionFetcher` takes an
  optional fetcher key, but it is **not** needed to keep two forms apart:
  `useFetcher` falls back to `useId()`, so every call already owns its own
  fetcher. Pass a key only to share one fetcher's state between components, or
  to keep it alive across an unmount.
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

- `/` — dashboard overview (real API: `reporting` domain, via `/stats`)
- `/contact-messages` — contact form submissions (real API: `contact-messages`
  domain)
- `/orders` — sticker orders (real API: `sticker-orders` domain)
- `/qr`, `/qr/generate`, `/qr/:code` — QR tokens (real API: `qr-codes` domain)
- `/events` — community events (real API: `events` domain)
- `/notifications` — admin notifications (real API: `notifications` domain)
- `/posts` — lost/found listings moderation (real API: `lost-items` domain)
- `/users`, `/users/:id` — user management (real, via better-auth's `admin()`
  plugin — no API domain of its own)
- `/administrators` — admin account management (real, via better-auth's
  `admin()` plugin — no API domain of its own)
- `/profile` — admin profile (better-auth session data; password change via
  `authClient.changePassword`)
- `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` — auth pages,
  sharing `routes/auth/layout.tsx` (the client app's auth layout: green branding
  panel on the left, form column on the right)

All dashboard routes are nested under `routes/dashboard/layout.tsx`. Every
dashboard loader calls `requireAdminSession(request)` (from
`shared/helpers/session.server.ts`), which forwards the `Cookie` header to
`/api/auth/get-session` and, when no valid admin session is found, redirects to
`/auth/login?redirectTo=<where they were headed>`. The auth pages are guarded
the other way round, once, by `routes/auth/layout.tsx`'s loader calling
`redirectIfAdminAuthenticated` — no individual auth page repeats the check.
`shared/helpers/redirect.ts` owns `redirectTo`: `sanitizeRedirect` keeps only
internal, non-auth paths, so the param can be neither an open redirect nor a
login loop.

#### Admin app conventions

> **`apps/admin` uses the target layout** (E13): `app/routes/dashboard/<page>/`
> for the dashboard pages, `app/routes/auth/<page>/` outside the shell,
> `app/components/`, `app/context/`, and
> `app/shared/{constants,helpers,utils}/`. Each dashboard page declares its own
> name once, as `handle.title` — the top bar and the browser tab title both read
> it through `shared/helpers/page-meta.ts`.

Identical to the client app conventions above, with these admin-specific notes:

- `shared/helpers/auth-client.ts` uses better-auth's `adminClient()` plugin for
  admin-only operations. `shared/helpers/session.server.ts` provides
  `getServerSession` / `requireAdminSession` — these replace the old `AuthGuard`
  client component.
- Two auth calls stay client-side, because the browser needs the `Set-Cookie`
  response directly: `routes/dashboard/profile/helpers/profile.client.ts` calls
  `authClient.changePassword`, and `context/auth.tsx` calls
  `authClient.signIn.email` from the provider's `login`.
- `users` and `administrators` have no API domain of their own: their
  `servers/*.service.ts` call better-auth's `admin()` plugin endpoints
  (`list-users`, `create-user`, `set-role`, `ban-user`, `unban-user`,
  `remove-user`) directly. The mutations are real and `remove-user` is
  irreversible. Because those endpoints read the **backoffice** session cookie,
  they must be addressed on `/api/admin-auth/admin/*` — `/api/auth/admin/*` is
  the public instance and answers 401 to a backoffice-only session. The
  authorization itself is better-auth's: `adminRoles: ['admin']` in
  `packages/auth`, so a `moderator` is refused server-side whatever the UI
  offers. `list-users` is called with a hard `limit`, which is a ceiling, not
  pagination.
- The unread notification count comes from
  `routes/dashboard/servers/dashboard.loader.ts`, the dashboard layout's loader,
  which hands it to `DashboardProvider` as a `counts` prop;
  `useDashboard().counts` exposes it, and the sidebar and
  `components/topbar.tsx` only read it. **No component or context in `admin`
  fetches any more** (this closed gap 6 of
  [MIGRATION-PLAN-ADMIN.md](MIGRATION-PLAN-ADMIN.md)); the app's only remaining
  call outside a `servers/` folder is `shared/helpers/session.server.ts`, the
  server-side session gate every loader goes through (`client` is the same: its
  `activity-hub` twin is closed, see below). Coming from a loader, the badge
  also revalidates with every action instead of being read once on mount.
  `/notifications/unread-count` answers a **bare number**, not `{ count }`: the
  admin typed it the second way until E6.3, so `notificationsUnread` was
  `undefined` and the badge silently never appeared. A counter the API cannot
  serve reads zero rather than throwing — a badge must never take the shell
  down.

#### Front-end tests

Both `apps/admin/vite.config.ts` and `apps/client/vite.config.ts` declare two
Vitest **projects**, discovered under `app/`:

- **`ui`** — `app/**/*.test.tsx`, run in a real Chromium through Vitest's
  browser mode (`@vitest/browser-playwright`). Components and hooks are mounted
  with `createRoutesStub` from react-router and driven through `page` /
  `userEvent`, all imported from `app/shared/helpers/testing.ts` — no test
  imports the runner's packages directly. A real browser is what removes the
  jsdom shims Radix and native form submission would otherwise need.
- **`node`** — `app/**/*.test.ts`, for pure modules (helpers, mappers, schemas).

Tests live in a `__tests__/` folder next to the file under test, named after it
(`shared/helpers/form.ts` → `shared/helpers/__tests__/form.test.ts`). Two traps
the config works around: the `reactRouter()` Vite plugin is **disabled under
Vitest** (`process.env.VITEST`), because it owns the route-module graph and an
SSR entry the browser runner cannot mount; and `optimizeDeps.entries` points at
the test files, so Vite pre-bundles up front instead of discovering the
`@app/ui/components` barrel's Radix packages mid-run and reloading. CI installs
the Chromium build once before `pnpm test`.

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
