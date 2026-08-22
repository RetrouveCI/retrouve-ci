# Plan de migration — `packages/*`

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre les étapes **E4**,
> **E5**, **E11** et la part « packages » de **E3**.
>
> Rappel méthode : une étape = une branche = une PR `gh` = une session, et **on
> demande la permission avant tout commit** (signatures GPG).

---

## 1. État actuel

| Package                  | Scope           | Build     | Rôle                                                    |
| ------------------------ | --------------- | --------- | ------------------------------------------------------- |
| `@app/database`          | ✅ renommé      | oui       | Prisma 7.8 — schéma, migrations, client                 |
| `@app/ui`                | ✅ renommé      | non (src) | shadcn/ui partagé client + admin                        |
| `@app/eslint-config`     | ✅ renommé      | non       | presets `base`, `react-internal`                        |
| `@app/typescript-config` | ✅ E4 (partiel) | non       | presets `base`, `react-router`, `nest`, `react-library` |
| `@app/vitest-config`     | ✅ renommé      | non       | presets `base`, `react`                                 |
| `@app/contracts`         | ✅ créé (E5/E6) | oui       | schémas Zod partagés front + back                       |
| `@app/web-kit`           | ✅ créé (E11)   | non (src) | code front commun client ↔ admin                       |

---

## 2. E4 — Presets partagés

**Branche** `migration-e4-presets-partages` · **scope** `packages/config` ·
**0,5 j** · dépend de E2 (Vitest 4).

### 2.1 `@app/typescript-config` — ✅ fait

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

**Fait.** La passe de correction a coûté **deux lignes**, toutes deux dans
`packages/ui` (`VariantProps` dans `sidebar.tsx`, `ToasterProps` dans
`sonner.tsx`) — pas la campagne que ce paragraphe laissait craindre.

Deux écarts assumés par rapport à la référence, parce que les reprendre aurait
été un changement de comportement déguisé en mutualisation :

- `lib` reste `esnext` et non `ES2024` ;
- `types` garde `vitest/globals` et non `node` — les tests des deux fronts
  s'appuient dessus pour écrire `describe` sans import.

Retirés au passage : `nextjs.json`, sans consommateur depuis que l'admin a
quitté Next.js, et l'alias `@retrouveci/ui/*` de `packages/ui/tsconfig.json`,
vestige de l'ancien scope que rien n'importait. `packages/ui` dérive désormais
de `react-library.json`, qui existait pour ça et n'avait aucun consommateur non
plus.

### 2.2 `@app/vitest-config` — 🔸 reste à faire, moins le preset `node`

⚠️ **Le preset `node` + SWC est écarté pour l'instant.** Il n'est indispensable
que si un test construit un module de test NestJS et laisse le conteneur
injecter ; aucun des 232 specs de l'api ne le fait — ils instancient les classes
à la main (`new XxxController(deps)`), et passent donc sans émission de
décorateurs. Ajouter `unplugin-swc` et `@swc/core` maintenant, ce serait deux
dépendances pour une capacité que rien n'exerce. Le preset doit arriver avec le
premier test qui en a besoin, ce qui est le sujet d'**E9**.

- ~~Ajouter **`node.js`** : `nodeConfig` = `baseConfig` +
  `environment: 'node'` + `oxc: false` +
  `plugins: [swc.vite({ module: { type: 'es6' } })]`. Le plugin SWC est
  **indispensable** pour que l'émission des décorateurs fonctionne et donc que
  l'injection NestJS marche sous Vitest. Nouvelle devDep : `unplugin-swc`,
  `@swc/core`.~~ → reporté à E9, voir ci-dessus.
- Aligner `base.ts` sur la référence : `globals: true`, `clearMocks: true`,
  `passWithNoTests: true`, coverage v8 avec
  `reporter: ['text', 'json', 'html']`.
- Compléter `react.ts` pour E10 (browser mode Playwright ou jsdom, selon
  l'arbitrage §6 du plan global).
- Basculer `apps/api/vitest.config.ts` → **`vitest.config.mts`** (l'app est en
  CommonJS, le package `@app/vitest-config` est ESM-only) et l'appuyer sur
  `nodeConfig`.

### 2.3 `@app/eslint-config` — 🔸 reste à faire

- Ajouter **`nest.js`** (repris de la référence) : règles TS pour NestJS, dont
  `max-params` que les controllers désactivent ponctuellement.
- ~~Supprimer **`next.js`** et la devDep `@next/eslint-plugin-next`.~~ ✅ déjà
  fait : ni le fichier ni la dépendance n'existent plus.
- Brancher `apps/api` sur le preset `nest`.

### Vérification

```bash
pnpm run typecheck && pnpm run lint && pnpm run test
```

---

## 3. E5 — Création de `@app/contracts` — ✅ fait

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

Deux écarts au plan, tous deux constatés à l'écriture : le package a aussi un
script `test` (11 cas sur les bornes de pagination, via le preset
`@app/vitest-config/base` que `apps/api` consomme déjà), et
`tsconfig.build.json` exclut `src/**/*.spec.ts`, sans quoi les specs
atterrissaient dans `dist`. `MAX_PAGE_SIZE` y est exporté, mais les six domaines
de l'API gardent leur copie jusqu'à E6.

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

## 5. E11 — `@app/web-kit` — ✅ fait

**Branche** `migration-e11-web-kit` · **scope** `packages/web-kit` · **1,5 j** ·
dépend de E7.

### 5.1 Doublons constatés client ↔ admin

⚠️ Ce tableau **datait d'avant E13** : les chemins ont changé et l'inventaire
était faux. Mesure refaite fichier par fichier (`diff` sur les 11 modules
présents dans les deux `app/shared/`) :

| Fichier                              | Identique ?                                     |
| ------------------------------------ | ----------------------------------------------- |
| `shared/types/action.ts`             | **oui, à l'octet**                              |
| `shared/helpers/form.ts`             | **oui, à l'octet**                              |
| `shared/utils/api-operation.ts`      | **oui, à l'octet**                              |
| `shared/hooks/use-action-fetcher.ts` | **oui, à l'octet**                              |
| `shared/helpers/testing.ts`          | oui, à l'octet — mais 2 lignes d'`export *`     |
| `shared/utils/api-fetch.ts`          | à 4 lignes près (l'en-tête `X-Auth-Audience`)   |
| `shared/utils/phone.ts`              | à 5 lignes près — déjà des réexports du contrat |
| `shared/helpers/auth-client.ts`      | non — plugins better-auth divergents            |
| `shared/helpers/redirect.ts`         | non — 23 lignes d'écart                         |
| `shared/helpers/session.server.ts`   | non — 38 lignes d'écart                         |
| `shared/helpers/page-meta.ts`        | non — 85 lignes d'écart                         |

Il n'existe ni `theme-toggle.tsx` ni `not-found.tsx` partagés dans `app/shared/`
: ces deux lignes du tableau d'origine ne décrivaient pas le dépôt.

### 5.2 Périmètre du package

Livré — le tronc commun réellement identique :

```
packages/web-kit/src/
├── api/{api-error.ts,api-fetch.ts}   # ApiError + createApiFetch(), une fabrique
└── action/{action.types.ts,form.ts,api-operation.ts,use-action-fetcher.ts}
```

`createApiFetch` est une **fabrique** et non une fonction : l'en-tête
`X-Auth-Audience: admin` était la seule différence entre les deux `apiFetch`, et
il décide quelle session l'API lit. Les deux moitiés de la règle sont testées —
le spec du backoffice vérifie que l'en-tête part, celui du client qu'il est
absent.

Les 65 fichiers qui importent ces modules n'ont **pas** bougé : chaque app garde
un réexport d'une ligne à son ancien chemin `@/shared/…`, comme `phone.ts` le
fait depuis E6.5.

À **ne pas** mutualiser : `auth-client.ts` (plugins better-auth divergents),
`session.server.ts` / `redirect.ts` / `page-meta.ts` (même idée, code réellement
différent), `helpers/testing.ts` (deux `export *` sur les paquets du runner — le
partager ferait entrer `vitest/browser` dans le graphe du paquet pour deux
lignes), `utils/phone.ts` (déjà un réexport du contrat), les layouts et la
navigation.

### 5.3 Renommage à faire au passage — ✅ sans objet

`shared/lib/api-client.ts` → `api-fetch.ts` : **déjà fait**, par E13. Le fichier
s'appelle `shared/utils/api-fetch.ts` dans les deux apps.

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
