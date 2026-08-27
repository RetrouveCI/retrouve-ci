# @app/auth

Shared authentication core, built on [Better Auth](https://better-auth.com).

The package exposes a **framework-agnostic** factory. It contains no NestJS
glue: wiring `createAuth` into a composition root is the consuming app's job.

## Exports

```ts
import { createAuth, getTrustedOrigins, logSecretDelivery } from '@app/auth'
import type { Auth, CreateAuthOptions, Session, User } from '@app/auth'
```

- `createAuth(prisma, options?)` — builds a Better Auth instance bound to a
  `PrismaClient`.
- `getTrustedOrigins(env?)` — reads `BETTER_AUTH_TRUSTED_ORIGINS`, falling back
  to the localhost origins outside production.
- `logSecretDelivery(kind, recipient, secret)` — where an OTP or a reset link
  goes until a mailer and an SMS gateway exist. Exported because app-supplied
  plugins need the same behaviour.
- `Auth`, `Session`, `User` — types inferred from the instance this package
  builds.

## What the package owns, and what an app decides

The package owns everything tied to the **data model**, because a single
database backs every instance and those parts have to agree: the Prisma adapter,
the extra user fields (`city`, `commune`), email/password sign-in, user
deletion, and the `admin()` plugin that defines the roles.

An instance decides its own **identity**:

| Option           | Role                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| `appName`        | Names the instance. **Does not** name its cookie — see the note below.   |
| `basePath`       | Where its routes are mounted. Defaults to `/api/auth`.                   |
| `cookiePrefix`   | Names the session cookie. This is what separates two instances.          |
| `plugins`        | On top of `admin()`. `apps/api` adds `phoneNumber()` for the public app. |
| `trustedOrigins` | Overrides `getTrustedOrigins()`.                                         |

That split is what makes **two instances** possible: two `cookiePrefix`es mean
two independent cookies, so one browser can hold a backoffice session and a
public-app session at the same time.

> `advanced.cookiePrefix` is documented as defaulting to `appName`, but on
> Better Auth 1.6.x it does not: setting only `appName` still yields
> `better-auth.session_token`. Verified against a running instance on 1.6.18 —
> pass `cookiePrefix` explicitly, whatever the version claims. Both prefixes
> were re-checked live on the 1.6.30 bump and are unchanged.

## Usage

The app supplies its own `PrismaClient` (through `@app/database`):

```ts
import { createAuth as createSharedAuth, logSecretDelivery } from '@app/auth'
import { phoneNumber } from 'better-auth/plugins'

export function createAuth(prisma: PrismaClient) {
	return createSharedAuth(prisma, {
		plugins: [phoneNumber({/* … */})],
	})
}
```

See `apps/api/src/infrastructures/auth/auth.config.ts`, and
`apps/api/src/infrastructures/auth/auth.module.ts` for the NestJS wiring.

## Not for the front-ends

`Session` describes the shared core, so it carries no `phoneNumber` — those
columns come from the `phoneNumber()` plugin the app supplies. The front-ends
also read `/api/auth/get-session` over JSON, where dates are strings rather than
`Date`s. Each front therefore keeps its own interface for that response, and
this package stays server-side.

## Environment contract

This package **loads no `.env`**: it reads the `process.env` of the **host**
process. The variables below belong to the consuming app's environment (see
`apps/api/.env.example`).

| Variable                      | Required | Role                                                                             |
| ----------------------------- | :------: | -------------------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`          |    ✅    | Signs sessions and tokens.                                                       |
| `BETTER_AUTH_URL`             |    ✅    | Public base URL of the API, for callbacks.                                       |
| `BETTER_AUTH_TRUSTED_ORIGINS` |    ⚪    | Allowed origins (CSV). Empty outside production falls back to localhost origins. |
| `NODE_ENV`                    |    ⚪    | `production` hardens the defaults: no fallback origins, secrets not logged.      |
