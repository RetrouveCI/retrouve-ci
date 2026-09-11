# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project overview

**RetrouveCI** is a lost-and-found platform for Côte d'Ivoire. Users can post
listings for lost/found items and use QR-code stickers that, when scanned,
redirect to a contact page. The UI is entirely in French.

Narrative architecture documentation lives in [`docs/`](docs/README.md) —
overview, applications, shared packages, business flows and operations. This
file stays **normative**: where the two disagree, this one wins and `docs/` has
a bug.

The interface overhaul of `apps/client` is **closed** — mobile-first, a QR
scanner, a completed dark theme, a PWA build-out and, last, web push. Its plan
is [`REFONTE-PLAN.md`](REFONTE-PLAN.md): one step, one branch, one PR, one
session, the same cycle the migration used. Every step is delivered and §8 has
no question left open, so the file is a **record** now, as `MIGRATION-PLAN.md`
became one — but it stays the reference for _why_ a screen is the way it is.
Read its §2 before touching any screen — it holds the interface and flow
invariants every step is reviewed against.

A **mobile app is planned but not started**: there is no `apps/mobile`, and the
one that existed on a `mobile-app` branch in June 2026 was removed and is no
longer recoverable here. Its plan is [`MOBILE-PLAN.md`](MOBILE-PLAN.md) — an
Expo app reproducing a Claude Design prototype against **this same API**. Read
its **§4 before writing any mobile screen**: the prototype is a mock, and on
five points it promises what the API does not do (a 4-digit OTP where
`OTP_LENGTH` is 6, an `RC-XXX-XXX` sticker code where the API mints
`RCI-XXXXXX`, two of three pack prices, a mobile-money step where stickers are
paid to the courier, and a coupon the browser applies itself). Where the
prototype and a contract disagree, the **contract wins**.

## Commands

All commands are run from the repo root using pnpm and Turborepo.

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start all apps in parallel (client :3000, admin :3001, api :3002)
pnpm build            # Build all packages and apps (packages build first)
pnpm lint             # Lint all workspaces
pnpm typecheck        # Type-check all workspaces
pnpm test             # Run unit tests (Vitest — api, contracts, admin, client)
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

⚠️ **`pnpm db:push` exists and is not part of the workflow.** `prisma db push`
applies a schema diff outside the migration history: it skips a migration's data
steps and leaves `_prisma_migrations` behind, so the next `db:deploy` fails on
objects that already exist. Measured on 2026-09-10 on a local database, where
three September migrations had been applied that way. To catch such a database
up, in `packages/database`:
`npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`
lists what is really missing; `npx prisma migrate resolve --applied <name>`
records each migration whose effect is already present — check it first, since
it asserts a state; then `pnpm db:deploy`.

Postgres and Redis for local development are provided by `docker-compose.yml`:

```bash
docker compose up -d  # Start Postgres (:5432) and Redis (:6379)
```

To run a single app or package in isolation:

```bash
pnpm --filter @app/client dev
pnpm --filter @app/admin dev
pnpm --filter @app/api dev
pnpm --filter @app/contracts build
```

Tests are run with **Vitest**, in **four** workspaces: `api`, `contracts`,
`admin` and `client`. `api` and `contracts` use `*.spec.ts` (node). Both
front-ends declare two Vitest **projects**: `node` for `__tests__/*.test.ts`
(pure modules) and `ui` for `__tests__/*.test.tsx`, run in a real Chromium
through browser mode. Both apps have suites for both projects.

`packages/ui` and `packages/web-kit` have **no runner at all**, which is why
every guard over shared front code lives in `apps/client/app/shared/__tests__/`
— the `cn()` token floor, the caller-forwarding rule, the safe-area criterion,
`web-kit`'s declared dependencies, and `FieldError`'s two rules. ⚠️ Count with
`.elements().length` in a browser test, never with `not.toBeInTheDocument()`: a
locator matching **several** elements resolves to no single element, so the
negative form passes on two matches exactly as it does on zero.

```bash
pnpm --filter @app/api test        # api only
pnpm --filter @app/contracts test  # the shared schemas
pnpm --filter @app/admin test      # both projects
pnpm --filter @app/admin test:ui   # browser-mode components/hooks only
```

Run each suite **on its own** when a count matters: the browser project is flaky
under parallel load, and a full-monorepo run can fail tests that pass alone.

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

**A refusal from the API lands on the field it names.** `ApiErrorBody` declares
`errors`, `ApiError` carries them as `fieldErrors`, and `withApiOperationData`
turns them into react-hook-form's `FieldErrors`. Two rules hold it together: a
name the form does not have folds into `root` — RHF renders an error for a
non-existent field **nowhere**, so passing it through would lose the message in
silence — and the envelope message (`Validation failed`) survives only when the
API named no field at all. The optional `fields` option maps the API's names
onto the form's and, by doing so, declares which fields the form has; exactly
one form needs it, the sticker order, which posts `address` where the contract
says `deliveryAddress`. On the API side `DomainExceptionFilter` answers the
**same** map as `ZodValidationPipe`, so a business refusal — a `ValidationError`
carrying a `field` — reaches a form the way a schema one does.

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

`shared/name.ts` owns the **name rule** — trimmed, `2..120` — and is the same
finding as the password one, on `user.name`: **three** rules on one column, at
odds. Sign-up trimmed and capped at 120; the account's own edit form capped at
120 but named no message, so Zod answered in **English**; administrator creation
capped at 80 with no message on the type error. Since an admin is also an
ordinary user, a name the public app stored was one the backoffice could not
re-save. 120 is the ceiling that won, for the reason the password floor rose:
widening the backoffice's locks nobody out where narrowing the public app's
would refuse a name already written. ⚠️ Its spec pins `2` and `120` as
**literals** in one assertion, because every other case there derives its
expectation from the constants — changing one moved both sides and left the
suite green.

`shared/number.ts` owns `formatNumber` — French thousands grouping, which is a
narrow no-break space and not the comma the hand-written figures carried. One
home, because a price, a listing count and a returned-object count all read the
same way; `sticker-orders`' `formatPrice` is an alias of it under its domain
name. ⚠️ Assert a formatted amount **through** it, never against a hand-written
« 11 000 »: Vitest's `toContain` on a raw string does not normalise whitespace
(Playwright's DOM text matching does).

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

It also owns `PAYMENT_ON_DELIVERY` / `PAYMENT_ON_DELIVERY_LABEL`. Stickers are
paid in cash to the courier, so `createStickerOrderSchema` accepts **no**
payment field and `CreateStickerOrderUseCase` stamps the constant on every row,
the way it already prices the order from the catalogue rather than from the
body. The column stays, so a mobile-money gateway later is a new value here and
not a migration; the backoffice's order dialog names the constant and shows any
other stored value as it was recorded. The client's mobile-money catalogue and
its `components/payment-step.tsx` are parked in comments for that day.

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
new category is a type error rather than a missing label. The **moderation
reason's sentence** lives here too (`moderation-reason.ts`), because the poster
reads it in two places — on the card in « Mes annonces » and in the
`listing_moderated` notification the API raises — and one fault must read one
way. What stays per-app is the backoffice's short **label** for the same code,
which is a moderator's vocabulary and not the owner's.

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

- Domains: `contact-messages`, `events`, `listing-comments`, `lost-items`,
  `matching`, `notifications`, `qr-codes`, `reporting`, `sticker-orders`. Each
  keeps its use-cases free of NestJS/HTTP concerns; controllers in
  `presentations/` are thin and delegate to use-cases.
- `presentations/` holds **more folders than `domains/` does**: `auth`,
  `health`, `stats` and `uploads` have no bounded context of their own. `stats`
  fronts the `reporting` domain, `auth` carries the OTP queue consumer and the
  `account` controller, and `health` and `uploads` are pure IO. A controller
  without a domain belongs there — it does not justify inventing one.
- Auth is **better-auth** (`@thallesp/nestjs-better-auth`): phone-number based
  for the client, email/password + admin role for the admin app.
- **Phone OTPs go out over SMS through Letexto, on their own BullMQ queue.**
  better-auth's `phoneNumber()` plugin still owns the code itself — it generates
  it, stores it and verifies it, so there is no parallel OTP store; the app only
  sets `expiresIn` (`OTP_TTL_SECONDS`, **300 s**), the code's length (six, the
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
- **Rate limiting is a Fastify `onRequest` hook, not a Nest guard**, because
  `/api/auth/*` is middleware mounted before Nest and sees no guard, pipe or
  interceptor — a Nest throttler would miss `send-otp` entirely. The hook is
  registered before `NestFactory.create`, reads its rules from
  `shared/rate-limit/rate-limit.policy.ts` (`otp`, `auth`, `public-write`,
  `public-read`, `upload`, `authenticated-write`) and keys them on the caller:
  `X-Client-Ip` when a front forwarded it, the socket address otherwise. It
  **fails open**, loudly — a limiter that cannot reach Redis must not take
  sign-in down with it. More ceilings sit **inside** Nest, where the identity is
  known and an address cannot be rotated: `OtpDispatcher` counts per phone
  number, and `AccountBudget` (`shared/rate-limit/`) per account, driven by an
  `AccountLimit` from the same policy — one service for every such ceiling,
  since all that differed between two of them was a constant and a sentence. It
  answers through `AccountBudgetFilter`, which shapes the **same** 429 body and
  `Retry-After` the hook does, so a front reads one shape whichever ceiling
  refused; a Nest exception carries no header, which is why this is a filter and
  not a per-controller helper. Every ceiling holds at the same time as the
  address one, and every one of them fails open.
- **A sticker order is bounded by what it commits, not by how fast it is
  placed.** Stickers are paid to the courier, so an open order is unpaid
  exposure: `CreateStickerOrderUseCase` refuses a new one while the account
  already holds `MAX_OPEN_STICKER_ORDERS`. `OPEN_STICKER_ORDER_STATUSES` and
  `SETTLED_STICKER_ORDER_STATUSES` are declared as a **partition** of the
  contract's statuses and asserted as one, so a status added there forces a
  decision instead of counting as settled by omission. Count-then-create is not
  atomic — bounding the exposure is the point, not sequencing it.
- **Every write route is accounted for.** `write-routes.spec.ts` discovers each
  `@Post`/`@Patch`/`@Put`/`@Delete` in `presentations/` and requires it to fall
  in exactly one class: capped by `limitFor`, admin-only (read from `@Roles`),
  or named as owner-scoped — a write on a row the caller already owns, bounded
  by what they hold. A route added later lands in none and turns the guard red.
  That is how `POST /account/set-initial-password` was found: the **one**
  password write mounted outside `/api/auth/*`, so the only one the prefix rule
  missed, and setting a password hashes it.
- **A notification speaks either to a visitor or to the desk, never to both.**
  `Notification.audience` is `USER` or `ADMIN`, and an `ADMIN` row carries **no
  `userId`**: it addresses the backoffice, so the first administrator who reads
  it reads it for all — the read state is shared, which is what a work queue
  wants. Which audience a read touches follows the **auth** audience
  `SessionGuard` resolved (attached to the request, not recomputed), so
  `/notifications/mine` needs no parameter and neither front-end had to change;
  the name is a misnomer for the backoffice, which reads the desk's. The
  contract pairs each type with its side (`audienceOf`, plus
  `ADMIN_NOTIFICATION_TYPES` / `USER_NOTIFICATION_TYPES`), and the **compiler**
  holds that pairing at each producer: `notifyDesk` takes an
  `AdminNotificationType`, `notifyUser` a `UserNotificationType`, and a
  visitor's notification does not build without a `userId`. ⚠️ `whereFor(scope)`
  in `domains/notifications/repository/` is the **only** place a notification
  `where` clause is built — the audience separation lives there and nowhere
  above, so add no second one. Its `userId: null` is load-bearing: without it
  the desk's clause would also match an administrator's own visitor rows.
- **Raising a notification must not put the write at risk.**
  `domains/notifications/helpers/notify.ts` holds one swallowing body and two
  façades over it — `notifyDesk` and `notifyUser`, each typed on its own narrow
  side, which is what keeps the compiler's guarantee that neither can address
  the other audience. It logs at error level, because the row already exists by
  then: an unreachable Redis must not answer 500 to the poster who just
  published. The three desk producers are `create-lost-item` (a listing is
  created `PENDING`, and publication is the only moment matching runs, so until
  the desk acts nothing happens at all), `create-sticker-order` (paid to the
  courier, so an order commits a delivery with cash expected on arrival) and
  `create-contact-message`. On the visitor's side, `moderate-lost-item` and
  `contact-lost-item-poster` were added by N2, and `reach-qr-token-owner` folded
  its own copy of the swallow onto the helper, as `update-sticker-order-status`
  did in N3. `contact-qr-token-owner` was the last one left, and it was the
  worst place for it: the finder's message is written before the notice is
  raised, so an unreachable Redis answered 500 to someone whose message _had_
  been recorded — and who would send it again. ⚠️ **Exactly one producer still
  does not swallow, and must not**: `notify-matches` runs inside a BullMQ job,
  so the failure has to reach the queue for the job to be retried.
  `domains/notifications/__tests__/notification-producers.spec.ts` holds that,
  and it reads a **property** rather than a spelling — every use-case naming
  `CreateNotificationUseCase` must go through `notifyDesk` / `notifyUser`, with
  `notify-matches` the single named exemption. That distinction is load-bearing:
  `notify-matches` holds its dependency under a different field name, so a probe
  grepping `createNotification.execute` sees six producers and misses it.
- **A comment on a listing is bounded by what the caller owns.**
  `ListingComment` is a suggestion between the desk and a poster (« ajoutez une
  photo du dos »), not a moderation decision — `moderationReasonNote` keeps that
  role, and the two channels coexist. `authorSide` is **stored**, because an
  administrator is also an ordinary user and posts as one on the public app: the
  side is the **audience** `threadScope(audience, user)` reads, never the role.
  ⚠️ The desk side needs the role **as well**: nothing refuses an ordinary
  account signing in to `/api/admin-auth` with its password, so the admin
  audience alone proves nothing. `whereFor(scope)` in
  `domains/listing-comments/repository/` is the **only** place a thread's
  `where` is built — a poster reaches only the listings they own, the desk every
  one. Two write paths for one use-case, since `limitFor` reads paths and not
  methods: `POST /lost-items/:id/comments` carries the poster's own
  `LISTING_COMMENT_PER_USER` ceiling, `…/comments/desk` is `@Roles(['admin'])`.
  Each side's write raises the other side's notification (`listing_commented` to
  the poster, `listing_replied` to the desk). `toListingCommentView` names what
  a thread answers, so the author's account id stays in the API.
- **A push subscription is a consented capability, not an audience
  measurement.** `PushSubscription` holds one row per browser, keyed on the
  endpoint the vendor issued, so a browser re-subscribing after its keys rotated
  **moves** the row rather than adding one; the owner is written on both sides
  of the upsert, so a device changing hands re-registers under the new account.
  A delete is scoped to the caller, and says nothing when the row is already
  gone — a browser whose permission was revoked elsewhere still calls it. ⚠️
  **Both routes share one path** (`POST` and `DELETE /notifications/push`), and
  `limitFor` matches on the path and not the method, so they cannot be
  classified apart: both are capped as an authenticated write, which is what the
  create needs since a caller could otherwise forge a row per invented endpoint.
  `GET /stats/push-subscriptions` answers the count as a **bare number**, the
  way `/notifications/unread-count` does. That count is the point: a
  subscription needs an install **and** a granted permission, so counting them
  answers « would a push reach anyone » without measuring anyone's usage — which
  is how A3's condition was unblocked without adding an analytics layer §8 calls
  a product and legal decision. The figure is read on the backoffice's
  **notifications** page, and a counter it cannot reach shows a dash rather than
  a zero nobody measured. The browser's half sits in `routes/account/settings`:
  ⚠️ **The invariant on those two keys is the _decoded_ size, and the encoded
  length is derived from it.** `PushSubscription.toJSON()` emits base64url
  **unpadded**, so 65 bytes of P-256 point are **87** characters and the 16-byte
  secret is **22** — not the 88 and 24 a padded encoding gives. A3b shipped the
  padded pair, which made the API answer 400 to every subscription the browser
  could produce: the count would have read zero for ever and the figure A3 rests
  on would have said « nobody wants push ». Neither side's spec saw it, because
  each built its fixtures from its own assumption — the contract's from its own
  constants, the client's from its own belief. What catches it is the one
  assertion that **crosses the seam**, in `apps/client`'s
  `helpers/__tests__/push.test.ts`, which can import both sides: it parses what
  `toRegistration()` produces through `pushSubscriptionSchema`. The contract's
  spec pins `87` and `22` as **literals** for the same reason `fullNameSchema`
  does. `helpers/push.client.ts` holds the plumbing (base64url both ways,
  `userVisibleOnly` being Chrome's requirement and not a choice) and
  `DevicePushRow` the switch. ⚠️ **That switch is per-device, not a preference**
  — a subscription belongs to one browser, where the two switches above it are
  per-type preferences nothing stores yet, so the « bientôt disponible » badge
  belongs to them alone. The browser is the source of truth for whether the
  device is subscribed, read on mount. `VAPID_PUBLIC_KEY` travels in
  `PublicEnv`, read at **runtime** like `API_URL` and never through
  `import.meta.env`; it is the public half by design and its private half never
  leaves the API. Unset, the row disables itself and **says which** of the four
  reasons applies rather than showing a dead button. **A3c wired the sending.**
  It hangs off `CreateNotificationUseCase`, not off `matching`, so all seven
  visitor types push at once and an eighth gets it for free. ⚠️ **It swallows on
  its own account, and that is load-bearing**: `notify-matches` deliberately
  does not swallow so BullMQ retries its job, and a retry re-creates the rows —
  a failing push must never reach that far. `WebPushClient`
  (`infrastructures/push/`) answers `sent` / `gone` / `failed` / `unconfigured`
  and never throws, being a side effect of a row that already exists. ⚠️
  **`gone` — a 404 or 410 — deletes the row**, because a count padded with
  dropped browsers would lie to the very decision it informs.
  `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` are read by
  `PushConfig`, and ⚠️ **an incomplete set is never fatal, production included**
  — unlike `LetextoConfig`: push is opt-in, and refusing to boot over it would
  trade a silence for an outage. The worker's `push` and `notificationclick`
  handlers read `app/sw/push-payload.ts`, split out like `cache-policy.ts` so it
  is testable in the `node` project. It never throws and always answers
  something showable, since `userVisibleOnly` is a promise to the browser; and
  it accepts only an internal path as the destination — a link arrives over the
  wire, and one that could open any origin would be an open redirect with a
  notification for a UI.
- **A stored photo is bounded in pixels, not only in bytes.**
  `uploadImageBuffer` passes an **incoming** `transformation`
  (`c_limit,w_2000`), applied before Cloudinary stores the asset — ⚠️ not
  `eager`, which pre-generates extra derived versions and leaves the master at
  full size. `MAX_PHOTO_SIZE` (5 Mo) bounds bytes, and five megabytes of JPEG
  can be 6000 px wide, so the two caps are complementary. The ceiling sits above
  the widest the front ever asks for (1600 device pixels, the detail gallery at
  2×), and no `q_auto`/`f_auto` is baked into the master because the display URL
  already applies one. `c_limit` never upscales, so a narrower photo is stored
  untouched — and asking for more than is stored yields the stored size rather
  than an error, which is why no cross-app guard was added.
- **The two public counters are counted, never written.** `GET /stats/counters`
  is anonymous and answers `{ published, resolvedThisMonth }`, read by the
  sign-in panel and by the home page's badge and « Voir les N annonces » link —
  all three used to derive the first figure from a list response's `total`,
  which counts what that query matched. It is deliberately **not** rate-limited:
  a front reads it server-side, so the address a limiter would see is the
  front's container, and a cap there refuses everyone at once — the reason
  `get-session` is exempt too. A front draws no band at all rather than
  announcing a zero, and `null` (an unreachable API) reads the same way. ⚠️
  `LostItem.resolvedAt` exists because `updatedAt` moves on any edit and could
  never answer « ce mois »; it moves **only** with the resolution status, so
  re-saving a resolved listing does not push the day into the current month. It
  is withheld from `PublicLostItem`, and what enforces that is
  `toPublicLostItem` not naming it — the projection spec compares the emitted
  keys, so the type's `?: never` is belt and not braces.
- **Where a sale came from is a closed enum, stamped like the price.**
  `StickerOrder.source` is `HOME` / `STICKERS_PAGE` / `ACCOUNT` / `DIRECT`,
  because the value arrives in a URL and what arrives in a URL is not trusted
  data. `createStickerOrderSchema` accepts it as optional and
  `CreateStickerOrderUseCase` stamps `direct` when absent — the body may
  **name** a source, never invent one — the way it already stamps
  `PAYMENT_ON_DELIVERY`. The client narrows the `?from=` param to the enum
  before it leaves the browser (`readSourceParam`), and the funnel's three steps
  are in-page state, so the marker the entry link carried is still in the URL
  when the last step submits. ⚠️ Four values for **five** entry points: both
  surfaces of the Stickers page are one `stickers_page` and both account
  surfaces one `account`, because what the figure separates is the shop window
  from the returning customer. The French labels live in the **backoffice**
  (`orders.const.ts`) — an operator's vocabulary, the same split the moderation
  reasons use.
- **An order tells its buyer at every step, on the transition alone.**
  `UpdateStickerOrderStatusUseCase` holds a
  `Record<StickerOrderStatus, StatusNotice | null>`, so a status added to the
  contract is a compilation error rather than a silent gap, and it notifies only
  when the status actually changed — the backoffice saving the same one twice
  tells the buyer once. `pending` maps to `null` on purpose: the desk heard
  about it through `order_placed`. The shipping notice names the cash to have
  ready, because a pack is paid to the courier. `formatPrice` lives in
  `@app/contracts/sticker-orders`, beside the catalogue it formats, so the
  notice and the tracking card cannot read differently — ⚠️ and it separates
  thousands with a narrow no-break space, so assert through it rather than
  against a hand-written « 11 000 ».
- **A moderation decision that changes nothing does nothing.**
  `ModerateLostItemUseCase` compares the row before the write with the row after
  it, on all three moderation columns, and raises `listing_moderated` only when
  they differ — so re-hiding for a different reason notifies, and publishing
  twice does not. It answers a `ModerationOutcome`, whose `becamePublished` is a
  **transition**, not a state: the controller dispatches matching on that rather
  than on `moderationStatus === 'published'`, which was true whether the write
  changed anything or not and made a second publish search — and notify — again.
  The verdict wording is a `Record<ModerationStatus, …>`, and it deliberately
  promises no return online, because `repository.update()` writes no moderation
  status.
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
  to HTTP responses by `DomainExceptionFilter`. A body field that is simply
  _missing_ used to answer in English, since a schema that names no message for
  the type error never reaches its `.min()`. The pipe now passes
  `z.locales.fr().localeError` as a **per-call** error map, which is what makes
  this safe: `z.config()` would have translated better-auth's own messages too,
  since the zod instance is shared, and the pipe is the API's only parse site. A
  message the schema does name still wins — the locale is consulted only for an
  issue that has none. The fallback wording is Zod's own and reads poorly, so
  naming a field's message explicitly remains the better fix; what the pipe
  guarantees is that English is no longer possible.
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
layer **names** and their _contents_ both match the target layout now: one
use-case per file, a `<domain>-domain.module.ts` per domain, `models/` folded
into `types/`.

### Frontend apps (React Router v7)

Both apps share the same stack:

- **React Router v7** (Vite, SSR) with React 19, TypeScript
- **Tailwind CSS v4** — configured via CSS `@theme` directives, not a JS config
  file
- **shadcn/ui** — components imported via `@app/ui/components`
- **Forms are react-hook-form + zod** everywhere, in both apps and in
  `packages/ui`. The `@conform-to/*` packages are gone from the catalog.
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
- `/posts`, `/posts/:id` — browse and view listings
- `/publish`, `/publish/lost`, `/publish/found` — post a listing
- `/scan` — the QR scanner: permission primer, live viewfinder, manual code
- `/q/:code` — the public page a scanned sticker lands on, outside the shell
- `/stickers`, `/stickers/order` — QR sticker info and ordering
- `/account`, `/account/posts`, `/account/posts/:id`, `/account/orders`,
  `/account/stickers`, `/account/settings` — user account
- `/notifications` — the visitor's notification list
- **Auth pages carry no `/auth` prefix**: `/login`, `/register`,
  `/password-forgotten`, `/reset-password`. They share `routes/auth/layout.tsx`,
  so the folder is still `routes/auth/<page>/` — the _folder_ says `auth`, the
  _URL_ does not. R31 dropped the prefix, and `shared/helpers/redirect.ts` lists
  these four in `AUTH_PATHS`: a new auth page left out of that array opens a
  sign-in loop.
- `/offline` — where the service worker sends a navigation it can serve from
  neither the network nor the cache
- `/objet-perdu-cote-divoire`, `/carte-identite-perdue` — the two **search
  landing pages**, prose that answers a query rather than app screens. They are
  in `INDEXABLE_PATHS`, and a guard makes every mounted page fall in exactly one
  of three classes — indexable, disallowed, or enumerated by the sitemap — so a
  public page can no longer be added and left out of the sitemap in silence.
- `/about`, `/contact`, `/download`, `/privacy`, `/terms`

Four paths are **resource routes read by a hook** — a `servers/*.loader.ts`
mounted with no component, `fetcher.load`ed rather than fetched per navigation:
`scan/status`, `publish/matches`, `account/posts/matches` and
`account/stickers/pending`.

⚠️ **Nine paths in `routes.ts` point straight at a `servers/*.ts`, and every one
of them must export a `loader`** — the four above, `robots.txt`, `sitemap.xml`,
the two that carry only an `action` (`posts/:id/contact` and `q/:code/reach`),
and `account/posts/:id/comments`, where a poster's reply to the team's thread
posts. Having no component means having no error boundary, so a GET a resource
route cannot answer is served **as the page**: React Router answers
`400 {"message":"Unexpected Server Error"}`, which is what a visitor read in
production on the contact route. And the GET is not exotic: a reload, a restore,
or a jump no dialer follows all land on it, so their `loader` redirects back to
the page the visitor came from.

⚠️ **Both post with `reloadDocument` and no `target`, and the `target` is the
part that matters.** The browser must follow the `Location` in the tab it is
already in — that is what lets the OS take a `https://wa.me/…` or a `tel:…` and
hand it to the app, and it needs no JavaScript. `q/:code/reach` was always this
shape; R46 gave the listing bar a `target="_blank"` instead, to keep R10's
separate tab, and **on a phone WhatsApp then never opened at all**. The
measurement behind R46 was real but ran in desktop Chromium only, which is
exactly where a blank tab does work. When those two actions refuse, they
redirect back with `?contact=` / `?reach=`, and **both pages narrow that param
in their loader and render it** — not a toast, since a jump that needs no
JavaScript must not need it to explain itself either.
`app/shared/__tests__/resource-route-get.test.ts` holds that property for all
nine, so a tenth cannot be mounted without one.

> **`apps/client` uses the target layout**:
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
> **Every route entry is mounted** — `routes.ts` has no commented-out entry
> left, `download` included, and `apps/client/tsconfig.json` excludes nothing
> but `node_modules` and `build`. A route whose entry were commented out would
> get **no `+types/` module**, since React Router generates them only for
> mounted routes, and would have to spell its loader args out. That signature
> (`({ request }: { request: Request })`) is now simply the common style for a
> loader that reads nothing but the request — mounted routes use it too, so it
> no longer tells you anything about whether a route is mounted.

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
  component. There are four (`scan/status`, `publish/matches`,
  `account/posts/matches`, `account/stickers/pending`), and the reason is always
  the same: the datum is wanted on an interaction, not on every navigation, so
  putting it in the root loader would cost a session round-trip per page — for
  anonymous visitors included. `scan/status` is the clearest case, being asked
  once per code read rather than per navigation. The calls that create or
  refresh the better-auth session cookie stay **client-side**, because the
  browser needs the `Set-Cookie` response directly: `sign-in/phone-number` via
  `AuthContext.login`, and — through a `helpers/*.client.ts` wrapper, never from
  a component — `phone-number/verify` in
  `routes/auth/helpers/phone-auth.client.ts`, plus `changePassword` and
  `phoneNumber.verify` in `routes/account/settings/helpers/settings.client.ts`,
  since this repo has no server-side mechanism to forward `Set-Cookie` from an
  API response back through a React Router action. Every other auth mutation
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

#### PWA and the service worker (`apps/client`)

The client is an installable PWA, and **its build has two stages**:

```bash
react-router build && vite build --config vite.sw.config.ts
```

The second one exists because a service worker is a stand-alone script at the
scope root, not a chunk of the route graph, so `react-router build` cannot emit
it. `vite.sw.config.ts` compiles `app/sw/service-worker.ts` to a single IIFE at
`build/client/sw.js`, with `emptyOutDir: false` — it runs **after** the app
build, which empties `build/`. Reversing the two erases the worker silently.

- **Policy is a separate, tested module.** `app/sw/cache-policy.ts` owns the
  cache names and versions, `strategyFor()`, `isPublicPath()` and
  `OFFLINE_PATH`; `app/sw/service-worker.ts` only wires it to the fetch event.
  That split is what makes the policy unit-testable in the `node` project
  (`app/sw/__tests__/cache-policy.test.ts`) without a browser.
- **`/offline`** is a real route in the shell, and the worker serves it for a
  navigation it can satisfy from neither the network nor the cache.
- **Registration** lives in `app/shared/helpers/service-worker.ts` — one call
  site, guarded on `'serviceWorker' in navigator`.
- **`public/manifest.webmanifest`** holds the identity (`id`, `scope`,
  `start_url`, `display: standalone`), three icons under two purposes (`any` at
  192 and 512, `maskable` at 512) and three shortcuts — scan, publish, search —
  whose PNGs sit beside it. `apple-touch-icon.png` is **not** in the manifest:
  iOS reads it from a `<link>` in `root.tsx`.

Two measurement traps are worth knowing before testing any of this: Playwright's
`setOffline` does **not** cut requests made _by_ the worker (kill the origin
instead), and Chromium's installability probe returns an empty error list for
everything in headless mode.

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
- **Every action answers `ActionResult`**, the client's contract, and every page
  reads it through `useActionFetcher` + `useSettledSubmission`. Seven pages used
  to declare a local `interface ActionResult { ok, … }` — one name, eight
  meanings — and read `fetcher.data.ok`; none does now. Two consequences worth
  knowing: an action no longer answers a non-200 status (the outcome is in the
  body, as it is in `apps/client`), and anything that is not an `ApiError`
  **rethrows** to the error boundary rather than becoming a toast, since a
  connection string is a bug and not an outcome.
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
  `components/topbar.tsx` only read it. **No component in `admin` fetches any
  more**; outside a `servers/` folder the only callers left are
  `shared/helpers/session.server.ts` — the session gate every loader goes
  through — plus `context/auth.tsx` and `profile.client.ts`, the two client-side
  calls named above that need `Set-Cookie` directly. `client` is the same shape,
  with `settings.client.ts` and `phone-auth.client.ts` as its wrappers. Coming
  from a loader, the badge also revalidates with every action instead of being
  read once on mount. `/notifications/unread-count` answers a **bare number**,
  not `{ count }`: the admin typed it the second way until E6.3, so
  `notificationsUnread` was `undefined` and the badge silently never appeared. A
  counter the API cannot serve reads zero rather than throwing — a badge must
  never take the shell down.

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
  with a **PAT** (`secrets.PAT_RETROUVECI`). That was originally because a tag
  pushed with the default `GITHUB_TOKEN` triggers no workflow; no workflow
  listens to tags any more, so the PAT is now belt-and-braces rather than
  load-bearing. **Nothing listens to a version tag.** The tag is a record, not a
  trigger.

**CI builds and deploys nothing.** Dokploy builds each app from its own
`apps/<app>/Dockerfile` and deploys on its own, so there is no registry in the
loop and no Docker Hub credentials to hold. A `docker.yml` used to push three
images to Docker Hub; it was removed once Dokploy took the build, because a
second build publishes artefacts nothing pulls.

Each app still has a multi-stage **`Dockerfile`** (build context = repo root),
and it is what Dokploy runs. The build does `turbo run build --filter=<app>`
then `pnpm deploy` to produce a self-contained runtime bundle. Notes:

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

## Known debt

The architecture realignment closed in August 2026. Its five
`MIGRATION-PLAN*.md` files were retired when `migration` merged into `main`;
they remain in the git history if you need the reasoning behind a particular
move. What follows is the part that was still **open** when they were deleted,
so it does not get lost with them. Anything not listed here was either closed or
deliberately declined.

### Catalog and tooling

- **`typescript` sits at `^6.0.3`, and `7.x` is blocked on the toolchain, not on
  this repo.** The 6 bump is done — it moved all nine `typecheck` tasks at once,
  and the one thing it broke is worth knowing, because it is not a TypeScript 6
  quirk but the rule from 6 onwards: **`@types/*` packages are no longer
  auto-included**, so a project must name what it needs in `types`. Only
  `packages/auth` actually went red, and the reason the others did not is
  incidental — a package still gets the Node globals when any `.d.ts` in its
  import graph imports a Node builtin, which NestJS and `pg` do and
  `better-auth` and `zod` do not. `apps/api` uses `process` in nine files on
  that accident alone, so `types: ["node"]` is declared in `nest.json` and in
  `database`'s config as well: there it is a safety net, not a fix. Deliberately
  **not** added to `base.json`, since `react-library.json` extends it and a
  browser component library must not typecheck `process.env`. **Do not try `7.x`
  as a version bump.** `typescript@7` is the native compiler and its package
  exports exactly two keys, `version` and `versionMajorMinor` — no compiler API
  — which was measured, not read: `nest build` dies on
  `tsBinary.getParsedCommandLineOfConfigFile is not a function`, and
  `typescript-eslint` refuses outright (`if (versionMajor >= 7) throw`), its
  peer being `>=4.8.4 <6.1.0`. Its own error names the way in: run 7 **side by
  side** with the 6.0 API. So adopting 7 means keeping two compilers, which is a
  lot of its own and not this one. Track `typescript-eslint` issue #10940 for
  TS >= 7.1.
- **`@app/eslint-config` has no `nest` preset.** `apps/api` extends `base`.
  Nothing in `apps/api/src` currently needs an `eslint-disable`, so this is a
  tidiness gap rather than a working one.
- **`@app/vitest-config` has no `node` (SWC) preset.** Deliberate: it is only
  needed when a spec builds a NestJS testing module and lets the container
  inject. None of the api's 106 spec files does — they instantiate classes by
  hand (`new XxxController(deps)`), so no decorator emission is required. Adding
  `unplugin-swc` and `@swc/core` now would be two dependencies for a capability
  nothing exercises.
- **Prettier diverges from the target** (`useTabs: true`, `printWidth: 80`
  versus spaces and 85). Reformatting was declined because it would drown every
  diff of the realignment and break `git blame`. If it is ever done, it must be
  one isolated commit plus a `.git-blame-ignore-revs`.

### `apps/api`

- **`reporting`'s ten `$queryRaw` calls are not covered**, and that is a
  decision, not an omission. The domain has no mapper — the SQL produces the
  rendered shape directly — so a test would only be worth anything against a
  real Postgres, which this repo's CI does not start. The day it does, that is
  an integration test, not a unit test.

### Security advisories

`pnpm audit` reports **seventeen** (recounted 2026-09-09), none of them
reachable. Re-run the count rather than trusting this paragraph — the set moves
— and re-check the reasoning before dismissing a **new** one. Expect Dependabot
to disagree: it counts on the default branch, `pnpm audit` on this checkout's
lockfile, so a mismatch is not a signal on its own.

⚠️ **Severity does not rank the work here; the dependency path does.** The
triage of the four advisories that arrived on 2026-09-09 landed the opposite way
round from how they were listed: the **high** one was inert and a **moderate**
one was live.

- **`morgan` — was reachable, now updated.** It is a production dependency of
  both fronts through `@react-router/serve`, the `CMD` of both front-end
  Dockerfiles, and `cli.js` calls `app.use(morgan('tiny'))` unconditionally — so
  it logs every request. `tiny` logs `:url`, which the caller controls, and
  1.11.0 passed **U+2028 through unescaped**: measured, not argued, by compiling
  the format and reading the emitted line. A URL carrying that separator forged
  a second entry in any log consumer that treats it as a line break. Unlike
  `qs`, no override was needed — the patched `1.12.0` sits **inside**
  `@react-router/serve`'s own `^1.10.1`, so the lockfile alone moves it, and
  1.12.0 was checked to emit a literal `\u2028` instead.
- **`js-yaml`, one high — not reachable.** Two copies are on disk and only
  `4.3.1` is in the advisory's `>=4.0.0 <4.3.2`. Its sole consumers are
  `@eslint/eslintrc` and `cosmiconfig` (under `@nestjs/cli`), both **dev**. What
  production carries is `5.3.0`, through `@nestjs/swagger` — above the range.
- **`hono`, three moderate — not reachable.** Same family as `@hono/node-server`
  below: it arrives under the Prisma CLI (`better-auth` → `prisma` →
  `@prisma/dev`). Nothing in `apps/*` or `packages/*` imports `@prisma/dev`, and
  neither does better-auth's own `dist`.

- **`qs` — was reachable, now pinned.** Two moderate denial-of-service
  advisories hit `qs@6.15.3`, which arrives through `@react-router/serve` →
  `express`, the `CMD` of **both** front-end Dockerfiles. Reachability here was
  **measured, not argued**: instrumenting `qs.parse` in a production build
  showed it receiving the raw query string of every request that carries one,
  `/terms?q=test&page=2` included — a fully static page. Worth knowing, because
  reading the code suggests the opposite: `@react-router/express` builds its URL
  from `req.originalUrl` with `new URL()` and never touches `req.query`. The
  parse happens anyway. `pnpm-workspace.yaml` now overrides `qs` to `6.16.0`,
  which is **outside** express's own `~6.15.1` range: no `6.15.4` was ever
  published, so the only patched release is a minor above what express asks for.
  Drop the override once express widens its range.
- **`fastify`, two moderate — not reachable.** `fastify@5.8.5` really is the
  server. The `X-Forwarded-*` spoofing needs `trustProxy`, which nothing in
  `apps/api/src` sets; the schema-validation bypass targets Fastify route
  schemas, and this API validates through `ZodValidationPipe` instead.
- **`@fastify/static`, four — not reachable.** Correcting what this file used to
  claim: `8.3.0` _is_ installed and linked under `@nestjs/platform-fastify`. It
  is simply never loaded — there is no `useStaticAssets` call and no import of
  it anywhere in `apps/api/src`.
- **`find-my-way`, one high — not reachable.** Two copies are on disk: `9.6.0`
  under `@nestjs/platform-fastify`, and the patched `9.7.0` under
  `fastify@5.8.5`, which is what actually routes. The advisory also needs
  HTTP/2, which the adapter does not enable.
- **`mysql2` (two), `deepmerge-ts`, `valibot`, `@hono/node-server` (two) — not
  reachable.** All six arrive through the Prisma **CLI** (`prisma`,
  `@prisma/dev`, `@prisma/config`). This repo talks to Postgres through
  `@prisma/adapter-pg`, and the `@hono/node-server` advisories are Windows
  `serveStatic` besides.
