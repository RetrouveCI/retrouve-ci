# `@app/web-kit`

The code `apps/client` and `apps/admin` genuinely share. Source-only, like
`@app/ui`: no build step, `exports` point straight at `src/`, and each app's
Vite compiles it.

## What is in here

| Sub-path              | Holds                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `@app/web-kit/api`    | `ApiError`, and `createApiFetch()` — the fetcher both apps build on                                                     |
| `@app/web-kit/action` | the action/form contract: `ActionResult`, `zodErrorToFieldErrors`, `rootError`, `withApiOperation*`, `useActionFetcher` |

The `action` sub-path is the E7 foundation. It was byte-identical in both apps,
which meant every form in the monorepo depended on two copies staying in step.

`createApiFetch` is a factory rather than a plain function because the two apps
address different audiences on one API: the backoffice sends
`X-Auth-Audience: admin` on every call, since a server-side call carries no
`Origin` and the API has no other way to choose between the two sessions. That
header was the only difference between the two `apiFetch` implementations.

## What deliberately stays in each app

- **`shared/helpers/auth-client.ts`** — different better-auth plugins
  (`phoneNumberClient` vs `adminClient`).
- **`shared/helpers/session.server.ts`**, **`redirect.ts`**, **`page-meta.ts`**
  — same idea, genuinely different code (38, 23 and 85 differing lines).
- **`shared/helpers/testing.ts`** — two `export *` lines over the test runner's
  own packages. Sharing it would drag `vitest/browser` and
  `vitest-browser-react` into this package's dependency graph to save two lines.
- **`shared/utils/phone.ts`** — already a re-export of `@app/contracts/shared`,
  which is where the rule lives.

## Importing it

Each app keeps a one-line re-export at its old `@/shared/...` path, so the 65
files that import these modules were left untouched. New code may import
`@app/web-kit/action` directly.
