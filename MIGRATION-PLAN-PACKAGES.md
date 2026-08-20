# Plan de migration — `packages/*`

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre les étapes **E4**,
> **E5**, **E11** et la part « packages » de **E3**.
>
> Rappel méthode : une étape = une branche = une PR `gh` = une session, et **on
> demande la permission avant tout commit** (signatures GPG).

---

## 1. État actuel

| Package                  | Scope            | Build     | Rôle                                        |
| ------------------------ | ---------------- | --------- | ------------------------------------------- |
| `@app/database`          | ✅ renommé       | oui       | Prisma 7.8 — schéma, migrations, client     |
| `@app/ui`                | ✅ renommé       | non (src) | shadcn/ui partagé client + admin            |
| `@app/eslint-config`     | ✅ renommé       | non       | presets `base`, `next-js`, `react-internal` |
| `@app/typescript-config` | ✅ renommé       | non       | presets `base`, `nextjs`, `react-library`   |
| `@app/vitest-config`     | ✅ renommé       | non       | presets `base`, `react`                     |
| `@app/contracts`         | 🔴 **à créer**   | oui       | schémas Zod partagés front + back           |
| `@app/web-kit`           | 🔸 à créer (E11) | non (src) | code front commun client ↔ admin           |

---

## 2. E4 — Presets partagés

**Branche** `migration-e4-presets-partages` · **scope** `packages/config` ·
**0,5 j** · dépend de E2 (Vitest 4).

### 2.1 `@app/typescript-config`

Ajouter deux presets repris de la référence :

- **`react-router.json`** — `lib: [DOM, DOM.Iterable, ES2024]`,
  `types: [node, vite/client]`, `module: esnext`, `moduleResolution: bundler`,
  `jsx: react-jsx`, `verbatimModuleSyntax`, `noEmit`, `strict`.
- **`nest.json`** — `module/moduleResolution: nodenext`,
  `experimentalDecorators`, `emitDecoratorMetadata`,
  `types: [node, vitest/globals]`, `target: ES2023`.

Puis faire dériver les apps :

| Fichier                     | Avant                             | Après                                                                      |
| --------------------------- | --------------------------------- | -------------------------------------------------------------------------- |
| `apps/client/tsconfig.json` | autonome (18 options recopiées)   | `extends: "@app/typescript-config/react-router.json"` + `paths`            |
| `apps/admin/tsconfig.json`  | autonome                          | idem                                                                       |
| `apps/api/tsconfig.json`    | `extends: base.json` + 12 options | `extends: "@app/typescript-config/nest.json"` + `rootDir`/`outDir`/`paths` |

Supprimer `nextjs.json` (plus aucune app Next).

⚠️ Le preset `react-router.json` de la référence active `verbatimModuleSyntax`,
que les apps RetrouveCI n'ont pas aujourd'hui : il impose `import type`
explicite. Prévoir une passe de correction (l'erreur TS est claire et
mécanique).

### 2.2 `@app/vitest-config`

- Ajouter **`node.js`** : `nodeConfig` = `baseConfig` + `environment: 'node'` +
  `oxc: false` + `plugins: [swc.vite({ module: { type: 'es6' } })]`. Le plugin
  SWC est **indispensable** pour que l'émission des décorateurs fonctionne et
  donc que l'injection NestJS marche sous Vitest. Nouvelle devDep :
  `unplugin-swc`, `@swc/core`.
- Aligner `base.ts` sur la référence : `globals: true`, `clearMocks: true`,
  `passWithNoTests: true`, coverage v8 avec
  `reporter: ['text', 'json', 'html']`.
- Compléter `react.ts` pour E10 (browser mode Playwright ou jsdom, selon
  l'arbitrage §6 du plan global).
- Basculer `apps/api/vitest.config.ts` → **`vitest.config.mts`** (l'app est en
  CommonJS, le package `@app/vitest-config` est ESM-only) et l'appuyer sur
  `nodeConfig`.

### 2.3 `@app/eslint-config`

- Ajouter **`nest.js`** (repris de la référence) : règles TS pour NestJS, dont
  `max-params` que les controllers désactivent ponctuellement.
- Supprimer **`next.js`** et la devDep `@next/eslint-plugin-next`.
- Brancher `apps/api` sur le preset `nest`.

### Vérification

```bash
pnpm run typecheck && pnpm run lint && pnpm run test
```

---

## 3. E5 — Création de `@app/contracts`

**Branche** `migration-e5-contracts-init` · **scope** `packages/contracts` ·
**0,5 j** · dépend de E2 (Zod 4).

C'est **l'étape pivot** de toute la migration : elle débloque la suppression des
`domains/*/validators/`, des DTO `class-validator` et de la duplication de types
côté front.

### 3.1 Squelette

```
packages/contracts/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── src/
    └── shared/
        ├── pagination.ts        # paginationQuerySchema (page, pageSize bornés)
        └── index.ts
```

`package.json` calqué sur le package de contrats de la référence :

```jsonc
{
	"name": "@app/contracts",
	"version": "1.0.0",
	"private": true,
	"type": "commonjs",
	"scripts": {
		"build": "tsc -p tsconfig.build.json",
		"typecheck": "tsc --noEmit",
	},
	"dependencies": { "zod": "catalog:" },
	"exports": {
		"./*": {
			"types": "./src/*/index.ts",
			"import": "./src/*/index.ts",
			"require": "./dist/*/index.js",
		},
	},
}
```

L'export par motif `"./*"` impose l'import **par sous-chemin** :
`@app/contracts/lost-items`. Pas de barrel racine — c'est une règle du skill
`backend-conventions`.

### 3.2 Câblage

- Ajouter `"@app/contracts": "workspace:*"` aux deps de `@app/api`,
  `@app/client`, `@app/admin`.
- `apps/api` consomme `dist/` (CJS) → le package doit builder avant l'API :
  Turbo s'en charge via `dependsOn: ["^build"]`, déjà en place.
- Les apps front consomment `src/` directement (condition `import`).

### 3.3 Contenu livré en E5

Uniquement `shared/pagination.ts` + le squelette. **Les schémas métier arrivent
en E6**, un domaine par PR — c'est ce qui rend chaque PR relisible.

---

## 4. E6 — Remplissage des contrats (rappel)

Détaillé côté API dans [MIGRATION-PLAN-API.md](MIGRATION-PLAN-API.md) §3, et
côté front dans les plans client / admin. Arborescence cible :

```
src/
├── shared/pagination.ts
├── auth/{login,register,password-forgotten,reset-password,otp}.schema.ts
├── contact-messages/{create,list-filter,update-status}.schema.ts
├── events/{create,update,list-filter}.schema.ts
├── lost-items/{create,update,list-filter,moderate}.schema.ts
├── notifications/{list-filter}.schema.ts
├── qr-codes/{generate,activate,update,list-filter,contact-owner}.schema.ts
└── sticker-orders/{create,list-filter,update-status}.schema.ts
```

Chaque dossier expose un `index.ts` qui réexporte ses `*.schema.ts`. Chaque
schéma exporte `z.input` **et** `z.output` typés (`XxxInput` / `XxxData`).

---

## 5. E11 — `@app/web-kit`

**Branche** `migration-e11-web-kit` · **scope** `packages/web-kit` · **1,5 j** ·
dépend de E7.

### 5.1 Doublons constatés client ↔ admin

| Fichier                                  | client | admin | Identique ?                            |
| ---------------------------------------- | ------ | ----- | -------------------------------------- |
| `app/shared/lib/api-client.ts`           | ✅     | ✅    | oui — `apiFetch` + `ApiError`          |
| `app/shared/auth/auth-client.ts`         | ✅     | ✅    | non — plugins différents (phone/admin) |
| `app/shared/auth/auth.server.ts`         | ✅     | ✅    | partiellement — même mécanique cookie  |
| `app/shared/components/theme-toggle.tsx` | ✅     | ✅    | oui                                    |
| `app/shared/components/not-found.tsx`    | ✅     | ✅    | quasi                                  |

### 5.2 Périmètre du package

À mutualiser (le tronc commun réellement identique) :

```
packages/web-kit/src/
├── api/{api-fetch.ts,api-error.ts}       # renommé : *Fetch = fonction (cf. frontend-conventions)
├── auth/{server-session.ts}              # forward du Cookie vers /api/auth/get-session
├── components/{theme-toggle.tsx,not-found-content.tsx}
└── theme/{theme.server.ts,theme.ts}
```

À **ne pas** mutualiser : `auth-client.ts` (plugins better-auth divergents), les
layouts, la navigation — chaque app garde les siens.

### 5.3 Renommage à faire au passage

`shared/lib/api-client.ts` → `api-fetch.ts`. Le fichier exporte déjà `apiFetch`
(conforme), mais son nom dit `client` — or la convention réserve `*Client` aux
objets à méthodes (SDK d'auth) et `*Fetch` aux fonctions.

---

## 6. Part « packages » de E3 (catalog)

`packages/database` épingle en dur `@prisma/adapter-pg` (7.8.0),
`@prisma/client` (7.8.0), `pg` (8.16.3), `prisma` (7.8.0), `@types/pg` (8.15.5),
`dotenv` (17.4.2). Toutes sont partagées avec `apps/api` → **elles doivent
passer au catalog** (règle : ≥ 2 packages ⇒ catalog).

`packages/ui` : `@conform-to/react` retiré en E7.G (`@conform-to/zod` n'y était
pas déclaré) ; reste à aligner `lucide-react`, `sonner`, `react-day-picker`,
`class-variance-authority`, `tailwind-merge`.

### Dérive de `ui/field.tsx` — repérée en E7.1, non corrigée

`packages/ui/src/components/ui/field.tsx` est une révision shadcn légèrement
antérieure à celle de l'architecture de référence. Hors formatage (divergence
§3.7 assumée), un seul écart de comportement, dans `FieldError` :

- la référence **déduplique** les messages par `message` avant de les rendre ;
- la référence renvoie `null` quand `errors` est un tableau **vide**, alors que
  la nôtre part sur la branche `<ul>` et rend une `<div role="alert">` vide.

Non corrigé en E7.1 pour ne pas mélanger un resync de composant shadcn avec la
pose du socle RHF. Les wrappers `FormInputField` / `FormTextareaField`
contournent le second point comme le fait la référence, par rendu conditionnel
(`{fieldState.error && <FieldError errors={[fieldState.error]} />}`), donc
`errors` n'est jamais vide. À resynchroniser via la CLI shadcn — candidat E9.

---

## 7. Packages de la référence non repris (et pourquoi)

| Package                  | Décision                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `@app/auth`              | ⏸️ différé — l'auth better-auth vit dans `apps/api/src/infrastructures/auth`. À extraire seulement si un 3ᵉ consommateur apparaît.           |
| `@app/permissions`       | ⏸️ différé — pertinent quand les rôles admin se densifient (aujourd'hui : `admin` / non-admin). Amènera `RequireRights(['posts:moderate'])`. |
| `@app/transactional`     | ⏸️ différé — à créer dès le premier email transactionnel (react-email).                                                                      |
| `@app/encryption`        | ❌ pas de besoin de chiffrement applicatif identifié.                                                                                        |
| `@app/branding`          | ❌ mono-marque.                                                                                                                              |
| `@app/business-calendar` | ❌ pas de logique de jours ouvrés.                                                                                                           |
| `@app/ldap-auth`         | ❌ auth par téléphone / email, pas d'annuaire d'entreprise.                                                                                  |

---

## 8. Ordre recommandé

```
E4 (presets) ──┐
               ├──> E6 (remplissage, par domaine)
E5 (contrats) ─┘
                    E7 (RHF) ──> E11 (web-kit)
```

E4 et E5 sont indépendantes l'une de l'autre et peuvent être menées dans
n'importe quel ordre une fois E2 passée.
