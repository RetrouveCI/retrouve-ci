# Shared packages

Eight packages. The interesting question about each is not what it holds but
**what duplication it exists to prevent**, because every one of them was created
after the same bug appeared twice.

| Package                  | Build step? | Resolved through                       | Imported as       |
| ------------------------ | ----------- | -------------------------------------- | ----------------- |
| `@app/database`          | yes         | `dist`                                 | barrel            |
| `@app/auth`              | yes         | `dist` (types from `src`)              | barrel            |
| `@app/contracts`         | yes         | `dist` by the API, `src` by the fronts | **sub-path only** |
| `@app/ui`                | no          | `src` via tsconfig paths               | sub-path          |
| `@app/web-kit`           | no          | `src` via `exports`                    | **sub-path only** |
| `@app/eslint-config`     | no          | —                                      | —                 |
| `@app/typescript-config` | no          | —                                      | —                 |
| `@app/vitest-config`     | no          | —                                      | —                 |

The three with a build step build first, through Turborepo's
`"dependsOn": ["^build"]`. `@app/ui` and `@app/web-kit` have no build script, so
that rule never applies to them and each app's Vite compiles their source.

> ⚠️ `apps/api` reads `@app/contracts` through its **`dist`**. A contract change
> needs `pnpm --filter @app/contracts build` before `nest start` picks it up.
> `pnpm build` and `pnpm test` handle it through `^build`.

## `@app/contracts`

**The single source of truth for every Zod schema shared between the API and a
front-end.** Sub-path imports only — `@app/contracts/shared`,
`@app/contracts/lost-items` — because `exports` uses a `"./*"` pattern. There is
no root barrel, by design.

Two rules hold for every schema added here:

- export **both** `z.input` and `z.output` as `XxxInput` / `XxxData`. A form
  types its fields on the input and its submit handler on the output.
- **never `z.coerce`.** Its `z.input` is `unknown` in Zod 4, which makes the
  exported `Input` type useless and untypable by react-hook-form. Use
  `z.union([z.number(), z.string().transform(Number)])` instead, and give the
  union its own `error` — a bare union reports `Invalid input` in English.

### What each entry stopped

| Entry                | Was written        | Consequence                                                                                                                                                                                                                 |
| -------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shared/password.ts` | **five** times     | One `user.password` column governed by five rules at once, so the public app could reset a backoffice account to six characters                                                                                             |
| `shared/phone.ts`    | three times        | Two front copies plus one inside the SMS gateway service                                                                                                                                                                    |
| `shared/otp.ts`      | twice, disagreeing | The phone-change form's `/^\d{4,8}$/` accepted a four-digit code the API could only reject                                                                                                                                  |
| `sticker-orders/`    | twice              | The pack catalogue, the delivery fee and the coupons — a price change could land on one side only                                                                                                                           |
| `lost-items/`        | —                  | `contactWhatsappSchema` normalises the number **once**, server-side; the client used to prefix `+225` onto a field its own regex allowed at 8–16 digits, storing `+2252250700000000` for a poster who typed `2250700000000` |

`shared/calendar-date.ts` deliberately does **not** use `z.iso.datetime()`: a
form posts what its input produces — `datetime-local` gives `2026-09-01T18:30`,
`date` gives `2026-09-01` — and neither carries the seconds and offset that
helper demands. It accepts both shapes and rebuilds the day, so 31 February is
refused rather than silently rolled over by `Date.parse`.
`calendarDateSchema({ required, invalid })` is a factory because each caller
names its own field.

A query string carries everything as a string, so a non-string filter needs the
same union the numbers use: `notifications/list-filter.schema.ts` reads `read`
as `z.union([z.boolean(), z.enum(['true','false']).transform(…)])`. Keep that
union local to the file that needs it until a second domain wants it.

**What a front still owns:** the French copy. `publish.const.ts`'s
`OBJECT_TYPES` and the backoffice's `posts.const.ts` are
`Record<LostItemCategory, …>` tables composed onto the contract's values, so a
new category is a type error rather than a missing label.

## `@app/auth`

**The shared better-auth core, as a framework-agnostic factory:**
`createAuth(prisma, { appName, basePath, cookiePrefix, plugins, trustedOrigins })`.
It holds no NestJS glue — wiring it into a composition root is the app's job
([`apps/api/src/infrastructures/auth/`](../../apps/api/src/infrastructures/auth)).

The split follows the data model. Because **one database backs every instance**,
the package owns the Prisma adapter, the extra user fields (`city`, `commune`),
email/password sign-in, user deletion, and the `admin()` plugin that defines the
roles. An instance decides only its own identity: `appName`, `basePath`,
`cookiePrefix`, and the plugins its audience needs. `apps/api` adds
`phoneNumber()` for the public app.

**That parameterisation is what makes two instances possible.** Two
`cookiePrefix`es mean two independent cookies. Note that `appName` does _not_
set the cookie prefix, despite what better-auth's option documentation suggests
— the default is the literal `better-auth`, and renaming it would sign every
existing account out.

It also owns **the password rule as the server enforces it**, reading
`@app/contracts/shared`: `minPasswordLength` / `maxPasswordLength` come from
`PASSWORD_MIN_LENGTH` / `PASSWORD_MAX_LENGTH`, and a `hooks.before` middleware
applies `passwordSchema` to `/admin/create-user` — the **one** password write
better-auth does not bound itself. Every other path checks the length on its
own, and neither sign-in route bounds the password it receives, so raising the
floor locks no existing account out.

**Server-side only.** `Session` describes the shared core, so it carries no
`phoneNumber` — those columns come from the app-supplied plugin. The front-ends
read `/api/auth/get-session` over JSON, where dates are strings, and each keeps
its own interface for that response.

## `@app/database`

Prisma schema, migrations and generated client — the single source of truth for
the data model, consumed by the API through its barrel.

- schema:
  [`packages/database/prisma/schema.prisma`](../../packages/database/prisma/schema.prisma);
  client generated into `src/generated/prisma` (provider `prisma-client`, CJS);
- connections use **driver adapters** (`@prisma/adapter-pg` over `pg`), with the
  connection string read from `PGBOUNCER_URL` or `DATABASE_URL`;
- Prisma's CLI is driven by
  [`prisma.config.ts`](../../packages/database/prisma.config.ts) — paths plus
  `DATABASE_URL` via dotenv — **not** by a `url` in the datasource block.

Models: `User`, `Session`, `Account`, `Verification`, `LostItem`, `QrToken`,
`StickerOrder`, `Notification`, `Event`, `ContactMessage`.

## `@app/web-kit`

The code the two front-ends **genuinely** share. Source-only, sub-path imports
only: `@app/web-kit/api`, `@app/web-kit/action`.

**`action/`** holds `ActionResult`, `zodErrorToFieldErrors`, `rootError`,
`withApiOperationData` / `withApiOperationError` and `useActionFetcher`. Those
four files were **byte-identical** in both apps, so every form in the monorepo
depended on two copies staying in step.

**`api/`** holds `ApiError` and `createApiFetch()`. It is a factory rather than
a plain function because the two apps address different audiences on one API:
the backoffice sends `X-Auth-Audience: admin` on every call, and that header was
the _only_ difference between the two former `apiFetch` implementations. Both
halves of that rule are asserted — the backoffice's spec checks the header is
sent, the client's checks it is absent, since the public app claiming the admin
audience is precisely what `SessionGuard` exists to prevent.

Each app keeps a one-line re-export at its old `@/shared/…` path, so the 65
files importing these modules were untouched. New code may import
`@app/web-kit/action` directly.

**What deliberately stays per-app:** `auth-client.ts` (different better-auth
plugins), `session.server.ts` / `redirect.ts` / `page-meta.ts` (same idea,
genuinely different code), `helpers/testing.ts` (two `export *` lines over the
test runner — not worth dragging `vitest/browser` into the package) and
`utils/phone.ts` (already a re-export of `@app/contracts/shared`).

## `@app/ui`

**The single shared shadcn/ui component library for the entire monorepo.** All
shadcn components live in `packages/ui/src/components/ui/` and are consumed by
both apps through the barrel exports.

**All new components go here**, never into an app's local directory:

```bash
cd packages/ui && npx shadcn add <component>
# or, from an app — both components.json point at the shared package
cd apps/client && npx shadcn add <component>
```

Exports: `@app/ui/styles` (design tokens + Tailwind base), `@app/ui/utils` (the
`cn()` helper), `@app/ui/components`, `@app/ui/hooks`.

This package **does not need to be built**: TypeScript paths in each app's
`tsconfig.json` resolve imports straight to `src/`.

### Styling

Tailwind CSS v4 with **no JS config** — everything through CSS `@theme`
directives. The token source of truth is
[`packages/ui/src/styles/globals.css`](../../packages/ui/src/styles/globals.css):
brand colours, shadcn CSS variables, animations, utilities. Each app's
`app/globals.css` imports it:

```css
@import '@app/ui/styles';
@source '../../../packages/ui/src';
```

The `@source` directive tells Tailwind to scan the shared package's sources so
component class names reach the generated CSS. **No `ui-` prefix** — all classes
are standard Tailwind. App-specific overrides go after the import.

## Config packages

`@app/eslint-config` (`base`, `react-internal`), `@app/typescript-config`
(`base`, `nest`, `react-library`, `react-router`) and `@app/vitest-config`
(`base`, `react`). Nothing surprising; see the `code-quality-setup` skill for
the rules they encode.

## Dependency versions

The **pnpm catalog** in [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) is
the single source of truth for versions. A package declares `"catalog:"`, never
a range, unless it has a documented reason not to. Renovate is configured in
[`renovate.json`](../../renovate.json): it groups related packages, auto-merges
patch/minor dev updates, and requires review for production dependencies and
majors.
