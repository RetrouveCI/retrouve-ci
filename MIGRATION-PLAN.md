# Plan de migration — alignement de RetrouveCI sur l'architecture de référence

> Objectif : rendre `retrouve-ci` conforme à l'**architecture de référence
> interne** (un front React Router v7 et une API NestJS déjà alignés), telle que
> formalisée par les skills `backend-conventions`, `frontend-conventions`,
> `unit-tests` et `dependency-management` présents dans `.claude/skills/`.
>
> Référence de comparaison : le monorepo de référence interne (front React
> Router v7 7.12 / API NestJS 11).

**Plans détaillés par cible** — à lire en complément de ce document :

| Cible         | Plan                                                     |
| ------------- | -------------------------------------------------------- |
| `packages/*`  | [MIGRATION-PLAN-PACKAGES.md](MIGRATION-PLAN-PACKAGES.md) |
| `apps/api`    | [MIGRATION-PLAN-API.md](MIGRATION-PLAN-API.md)           |
| `apps/client` | [MIGRATION-PLAN-CLIENT.md](MIGRATION-PLAN-CLIENT.md)     |
| `apps/admin`  | [MIGRATION-PLAN-ADMIN.md](MIGRATION-PLAN-ADMIN.md)       |

---

## 1. Méthode de travail (contraignante)

La migration est **incrémentale**. Chaque étape `E<n>` du tableau §4 suit
exactement ce cycle :

1. **Branche dédiée** depuis `migration` :
   `git switch -c migration-e<n>-<slug>`.
   > `migration` est la **branche d'intégration** : toutes les PR d'étape y sont
   > mergées, puis une PR finale `migration` → `main` clôt la migration. Le
   > tiret (et non le slash) dans le nom des branches d'étape est imposé par git
   > : une ref `migration` et une ref `migration/e1-…` ne peuvent pas coexister.
2. **Travail + vérification locale** :
   ```bash
   pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run format:check
   ```
3. **Demander la permission avant de committer.** Les commits sont signés GPG
   côté utilisateur — l'agent ne lance jamais `git commit` de sa propre
   initiative.
4. **Pull request via `gh`** (`gh pr create --base migration --fill`), titre en
   commit conventionnel avec le scope de l'étape (cf. `AGENTS.md`).
5. **Message de passation** en fin d'étape : un texte autonome (branche de
   départ, ce qui vient d'être fait, ce qui reste, fichiers concernés, commandes
   de vérification) que l'utilisateur colle pour démarrer la session suivante.

> ⚠️ **Une étape = une session.** Ne jamais enchaîner deux étapes dans la même
> session : le message de passation existe précisément pour repartir d'un
> contexte propre.

---

## 2. Ce qui est déjà fait

### 2.1 Outillage agents

| Élément                             | État                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `.claude/skills/` (9 skills projet) | ✅ repris de la référence, scopes réécrits en `@app/*`                                  |
| `.claude/agents/` (6 agents)        | ✅ copiés, contexte projet réécrit (client/admin/api, better-auth, RHF, DDD)            |
| `.claude/hooks/` + `settings.json`  | ✅ hooks typecheck / prettier / garde-fou git — **réécrits en scripts Node** (pas `jq`) |
| `.agents/skills/` (20 skills)       | ✅ copiés                                                                               |
| `skills-lock.json`, `.mcp.json`     | ✅ copiés (MCP shadcn)                                                                  |
| `AGENTS.md`                         | ✅ conventions commit / PR / validation / tests                                         |
| `.github/instructions/`             | ✅ `data-validation.instructions.md`                                                    |
| `.prettierignore`                   | ✅ exclut `.claude`, `.agents`, `skills-lock.json`, `.mcp.json` (comme la référence)    |

> Les hooks de la référence invoquent `jq`, absent de cette machine — ils
> étaient donc muets. Ils ont été réécrits en scripts (`.claude/hooks/*.sh` +
> `hook-input.mjs`) qui n'utilisent que Node. Divergence assumée et documentée.

### 2.2 Scope `@app/*` — **fait**

Tous les packages du workspace portent désormais le scope de la référence,
applications comprises :

| Avant                            | Après                    |
| -------------------------------- | ------------------------ |
| `api`                            | `@app/api`               |
| `client`                         | `@app/client`            |
| `admin`                          | `@app/admin`             |
| `@retrouve-ci/database`          | `@app/database`          |
| `@retrouve-ci/ui`                | `@app/ui`                |
| `@retrouve-ci/eslint-config`     | `@app/eslint-config`     |
| `@retrouve-ci/typescript-config` | `@app/typescript-config` |
| `@retrouve-ci/vitest-config`     | `@app/vitest-config`     |

169 fichiers touchés (package.json, tsconfig paths, imports, vite/vitest
configs, Dockerfiles, workflows CI, docs). Les filtres ont suivi :
`--filter=@app/api`, etc. Le scope `@retrouve-ci` n'existe plus nulle part.
Références mortes `@repo/ui` supprimées.

**Vérifié** : `pnpm install` + `typecheck` (5/5) + `lint` (4/4) + `test` (188
tests, 30 fichiers)

- `format:check` — tout vert.

Le nom du package racine reste `retrouve-ci` (la racine n'est pas scopée).

### 2.3 Socle racine (E1) — **fait**

| Sujet             | Résultat                                                                                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfig.json`   | `extends: "@app/typescript-config/base.json"` (le reliquat `expo/tsconfig.base` ne résolvait plus). La racine déclare désormais le package en `devDependencies`, sans quoi le `extends` reste muet. |
| Script typecheck  | `check-types` → `typecheck` : racine, 5 `package.json`, `turbo.json`, `test-ci.yml`, `.claude/hooks/typecheck.sh`, `CLAUDE.md`, 3 `README.md`                                                       |
| Runtimes          | `engines.node: ">=24 <25"`, `.nvmrc` (`24`), `.npmrc` (`engine-strict=true`, `use-node-version=24.13.1`), `packageManager: pnpm@11.10.0`                                                            |
| Conséquence CI/CD | `engine-strict` impose de bumper Node **24** dans les 4 jobs de `test-ci.yml` et dans les 3 `Dockerfile` (`node:22-` → `node:24-bookworm-slim`), sinon `pnpm install` échoue                        |
| Catalog           | `turbo: 2.10.5` et `prettier: ^3.6.0` catalogués, + `minimumReleaseAgeExclude` sur `turbo@2.10.5` et ses 6 binaires `@turbo/<platform>`                                                             |
| `turbo.json`      | tâches `db:push`, `db:seed`, `//#format-and-lint` ajoutées ; `outputs: ["coverage/**"]` sur `test` ; `dependsOn: ["^db:generate"]` sur `lint` et `typecheck`                                        |
| Prettier          | style **inchangé** (tabs / 80) — arbitrage §6                                                                                                                                                       |

`db:push` est implémenté par `@app/database` (`prisma db push`). La tâche
`db:seed` est **déclarée mais sans implémentation** : aucun workspace n'expose
encore ce script (le seed tourne au démarrage de l'API, dans
`infrastructure/seeder`). Elle est là pour la cible.

**Vérifié** : `typecheck` (6/6, `^db:generate` inclus) + `lint` + `test` +
`format:check`.

### 2.4 Bump Zod 4 + Vitest 4 (E2) — **fait**

| Sujet             | Résultat                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `zod`             | `^3.24.1` → `^4.4.3`. **`apps/api` n'utilise pas Zod** (validation `class-validator`) : le périmètre réel est le front, pas 17 fichiers mais 6 |
| `vitest`          | `^3.2.4` → `^4.1.9` (résolu en 4.1.10), idem `@vitest/coverage-v8`. Aucun changement de config nécessaire, 188/188 tests verts                 |
| `react-hook-form` | `^7.54.1` → `7.71.1` et `@hookform/resolvers` `^3.9.1` → `5.2.2` (préparent E7)                                                                |
| Conform           | les 31 fichiers important `@conform-to/zod` basculent sur l'entrée `@conform-to/zod/v4` — un import par fichier, retiré entièrement en E7      |
| jsdom             | **inchangé** (`^25.0.1`, compatible Vitest 4) — le browser mode est tranché en E10 (§6)                                                        |
| Catalog           | `minimumReleaseAgeExclude` de turbo réaligné `2.10.5` → `2.10.7` (dérive laissée par E1)                                                       |

Corrections Zod 4 effectivement nécessaires — 6 fichiers seulement, les motifs
`errorMap` et `z.record(K, V)` étant absents du dépôt :

| Motif                                  | Remplacement                                    | Fichiers                                                 |
| -------------------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| `z.string({ required_error })`         | `z.string({ error: issue => … })` (supprimé v4) | `admin/administrators`                                   |
| `z.string().email(m)`                  | `z.email(m)`                                    | `admin/{administrators,auth/login,auth/forgot-password}` |
| `z.string().trim().email(m)`           | `z.string().trim().pipe(z.email(m))`            | `client/{contact,qr-contact}`                            |
| `z.coerce.number()` (entrée `unknown`) | `z.coerce.number<string>()`                     | `admin/qr/generate`                                      |

> `.trim().pipe(z.email())` plutôt que `z.email().trim()` : en Zod 4 les checks
> s'exécutent dans l'ordre où ils sont ajoutés, donc `z.email().trim()`
> validerait **avant** de trimmer et rejetterait un email collé avec des
> espaces. Seul effet de bord du `pipe` : `getZodConstraint` n'émet plus
> l'indice HTML `type=email` — sans objet, Conform disparaît en E7.

Le paramètre `message` (encore supporté en v4) n'a **pas** été converti en
`error` : ce serait de la churn cosmétique sur des schémas que E5/E6 réécrivent
dans `@app/contracts`.

**Vérifié** : `typecheck` (6/6) + `lint` (5/5) + `test` (188/188, 30 fichiers) +
`format:check`. Plus un test de fumée hors dépôt sur les schémas touchés
(`parseWithZod` / `getZodConstraint`) confirmant que messages requis, messages
de check, coercition et contraintes HTML sont identiques à Zod 3.

---

## 3. État des lieux — écarts restants

### 3.1 Racine du monorepo

Tout le socle racine a été traité en **E1** (§2.3) ; il ne reste que les docs
d'architecture, prévues en E12.

| Sujet            | Référence                                              | État                         |
| ---------------- | ------------------------------------------------------ | ---------------------------- |
| Script typecheck | `typecheck`                                            | ✅ E1                        |
| `tsconfig.json`  | `extends: "@app/typescript-config/base.json"`          | ✅ E1                        |
| Node             | `>=24 <25`, `.nvmrc`, `use-node-version` dans `.npmrc` | ✅ E1                        |
| pnpm             | `11.10.0`                                              | ✅ E1                        |
| Turbo            | `2.10.5`, dans le catalog                              | ✅ E1                        |
| `turbo.json`     | tâches `test` / `db:*` / `typecheck` complètes         | ✅ E1                        |
| Prettier         | espaces (2), `printWidth: 85`                          | 🟠 divergence assumée (§3.7) |
| Docs archi       | `docs/architecture/*.md` (5 docs)                      | 🔸 E12                       |

### 3.2 Dépendances — catalog pnpm

Le catalog est la source de vérité (skill `dependency-management`). Trois
problèmes :

**a) 27 versions divergentes** de la référence — **toutes traitées sauf les
quatre majors et `typescript`** :

| Package                                   | RetrouveCI | Référence  | Impact                                 |
| ----------------------------------------- | ---------- | ---------- | -------------------------------------- |
| `zod`                                     | `^4.4.3`   | `^4.4.3`   | ✅ E2                                  |
| `vitest` / `@vitest/coverage-v8`          | `^4.1.9`   | `^4.1.9`   | ✅ E2                                  |
| `react-hook-form`                         | `7.71.1`   | `7.71.1`   | ✅ E2 (prépare E7)                     |
| `@hookform/resolvers`                     | `5.2.2`    | `5.2.2`    | ✅ E2 (API `standardSchemaResolver`)   |
| `react` / `react-dom`                     | `^19.2.7`  | `^19.2.7`  | ✅ E3                                  |
| `react-router` (+ `dev`, `node`, `serve`) | `7.18.2`   | `7.12.0`   | ✅ E3 — **en avance**, voir ci-dessous |
| `tailwindcss` + `@tailwindcss/vite`       | `^4.3.1`   | `^4.3.1`   | ✅ E3                                  |
| `@types/node`                             | `^24.13.2` | `^24.13.2` | ✅ E3 (suit le bump Node d'E1)         |
| `typescript`                              | `5.9.2`    | `^6.0.3`   | 🟠 à faire après le reste              |
| `lucide-react`                            | `^0.564.0` | `^1.21.0`  | 🟠 major — vérifier les noms d'icônes  |
| `sonner`                                  | `^1.7.1`   | `^2.0.7`   | 🟠 major                               |
| `recharts`                                | `2.15.0`   | `^3.9.0`   | 🟠 major — dashboard admin             |
| `react-day-picker`                        | `9.13.2`   | `^10.0.1`  | 🟠 major                               |

Mineurs alignés en E3 : `date-fns` `4.4.0`, `eslint` `^9.39.5`, `isbot`
`^5.2.1`, `vite` `^7.3.6`, `@vitejs/plugin-react` `^5.2.0`, `@types/react`
`19.2.17` (override compris), `@types/react-dom`, `vite-tsconfig-paths`.

> `react-router` est monté en **7.18.2**, au-delà du `7.12.0` de la référence.
> Même arbitrage que Prisma (§3.7) : on ne rétrograde pas pour s'aligner.

**b) Dépendances hors catalog** — ✅ **E3**. Les 24 dépendances épinglées en dur
de `apps/api` (`@nestjs/*`, `fastify`, `bullmq`, `class-validator`,
`class-transformer`, `better-auth`, `cloudinary`, `dotenv`, `rxjs`,
`reflect-metadata`, `tsc-alias`, `concurrently`…) et les 6 de
`packages/database` (`prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg`,
`@types/pg`, `dotenv`) sont passées au catalog.

Restent épinglées en dur, **volontairement** : les dépendances mono-consommateur
(`@tailwindcss/cli` et `tw-animate-css` dans `ui`, les 8 plugins ESLint dans
`eslint-config`, `@tanstack/react-table` et `qrcode.react` dans `admin`,
`prettier-plugin-tailwindcss` à la racine). La règle est « toute dep utilisée
par ≥ 2 packages va au catalog » — aucune de celles-ci ne l'est.

**c) Dépendances à retirer** — ✅ **E3** pour `next`,
`@next/eslint-plugin-next`, `@tailwindcss/postcss` et `postcss`. Ce n'était pas
qu'une suppression de lignes du catalog :

- `packages/eslint-config` perd son preset `next.js` et l'export `./next-js` ;
- `packages/ui` perd `postcss.config.js` et l'export `./postcss`.

Aucun workspace ne les référençait — vérifié avant suppression.

`@conform-to/react` + `@conform-to/zod` restent jusqu'à **E7** (voir §3.4).

> `prisma` / `@prisma/client` sont en **7.8.0** ici contre **7.4.0** dans la
> référence : RetrouveCI est en avance, on **ne rétrograde pas**.

**Absents du catalog** — ✅ **E3** pour `@faker-js/faker`, `tiny-invariant`,
`remix-utils`, `react-router-devtools` et `vitest-mock-extended`. Ces cinq
entrées n'ont **encore aucun consommateur** : elles sont posées pour E5 / E9 /
E10 et restent inertes d'ici là. `prettier` et `turbo` avaient été catalogués en
E1.

L'outillage de test front (`@vitest/browser-playwright`, `playwright`,
`vitest-browser-react`) est **volontairement laissé de côté** : il arrive en E10
avec les premiers tests front (§6).

### 3.3 Packages

| Package de référence                                            | Équivalent RetrouveCI | Écart                                             |
| --------------------------------------------------------------- | --------------------- | ------------------------------------------------- |
| `<produit>-database`                                            | `@app/database`       | ✅ équivalent                                     |
| `@app/ui`                                                       | `@app/ui`             | 🔸 dépend de Conform (`components/form/`)         |
| `@app/eslint-config`                                            | idem                  | ✅ preset `next-js` supprimé (E3) ; manque `nest` |
| `@app/typescript-config`                                        | idem                  | 🔸 manque `react-router.json` et `nest.json`      |
| `@app/vitest-config`                                            | idem                  | 🔸 manque le preset `node` (SWC/decorators Nest)  |
| **`<produit>-contracts`**                                       | **absent**            | 🔴 **manquant** — pas de source de vérité Zod     |
| `@app/auth`, `@app/permissions`, `@app/transactional`           | absents               | 🔸 selon besoin (voir plan packages)              |
| `@app/encryption`, `branding`, `business-calendar`, `ldap-auth` | absents               | ⚪ non pertinents                                 |

### 3.4 Formulaires : Conform → react-hook-form

**Décision : on migre vers react-hook-form**, comme la référence. La note
précédente qui classait Conform en « divergence assumée » est caduque.

Trois raisons convergentes :

- alignement sur la référence (`react-hook-form` +
  `@hookform/resolvers/standard-schema`) ;
- les README des deux apps annoncent **déjà** « react-hook-form + zod » — la doc
  était fausse ;
- `packages/ui` embarque déjà le composant shadcn `form.tsx` bâti sur
  `react-hook-form`, inutilisé, **en parallèle** de
  `components/form/{input,textarea}-field.tsx` bâtis sur Conform.

Périmètre : **41 fichiers** — 29 dans `client`, 10 dans `admin`, 2 dans
`packages/ui`.

### 3.5 Back-end `apps/api`

```
Actuel                                  Cible (backend-conventions)
src/                                    src/
├── domains/<d>/                        ├── domains/<d>/
│   ├── models/          🔴 en trop     │   ├── repository/
│   ├── validators/      🔴 en trop     │   ├── use-cases/     ← 1 fichier / use-case
│   ├── types/                          │   ├── mappers/
│   ├── mappers/                        │   ├── types/
│   ├── errors/                         │   ├── errors/
│   ├── repository/                     │   ├── helpers/
│   └── use-cases/       🔴 1 gros      │   └── <d>-domain.module.ts   🔴 absent
│       └── <d>.use-cases.ts            │
├── infrastructure/      🔴 singulier   ├── infrastructures/
├── presentation/        🔴 singulier   ├── presentations/<feature>/
│   └── <f>/dto/         🔴 class-val.  │       ├── controllers/ services/ workers/ queue-consumers/
├── libs/                🔴 hors norme  ├── shared/
└── shared/                             └── (libs/ supprimé → infrastructures/)
```

8 domaines, 84 fichiers TS. Détail complet et ordre de migration :
[MIGRATION-PLAN-API.md](MIGRATION-PLAN-API.md).

### 3.6 Front `apps/client` et `apps/admin`

`app/features/<f>/{components,hooks,mappers,servers,lib}` est **déjà** la
structure décrite par `frontend-conventions` — plus conforme que la référence
elle-même, qui a gardé `app/routes/`. Le travail front est du raffinement, pas
une refonte : contrats partagés, RHF, `types/` en sous-dossier, tests
(aujourd'hui **zéro** côté front), mutualisation client ↔ admin.

Détails : [MIGRATION-PLAN-CLIENT.md](MIGRATION-PLAN-CLIENT.md) ·
[MIGRATION-PLAN-ADMIN.md](MIGRATION-PLAN-ADMIN.md).

### 3.7 Divergences assumées (à ne PAS migrer)

- **Fastify vs Express** : RetrouveCI est sur `@nestjs/platform-fastify`. Aucun
  bénéfice à s'aligner sur Express.
- **Prisma 7.8 > 7.4** : on garde l'avance.
- **Un seul package `database`** : la référence en a deux parce qu'elle porte
  deux produits.
- **Prisma driver adapters, Cloudinary, BullMQ** : choix propres à RetrouveCI.
- **Hooks Claude en scripts** plutôt qu'inline (`jq` absent).
- **Style Prettier** : ✅ tranché en E1 — on **garde** `useTabs: true` /
  `printWidth: 80`. Un reformatage global noierait tous les diffs de la
  migration et casserait `git blame`. À reconsidérer après E12, en commit isolé
  accompagné d'un `.git-blame-ignore-revs`.

---

## 4. Découpage en étapes

Une ligne = une branche = une PR = une session.

| #       | Étape                                       | Branche                            | Scope commit                  | Charge | Dépend de |
| ------- | ------------------------------------------- | ---------------------------------- | ----------------------------- | ------ | --------- |
| **E0**  | ✅ Scope `@app/*` + outillage agents        | (fait)                             | `root/tooling`                | —      | —         |
| **E1**  | ✅ Socle racine & hygiène                   | (fait)                             | `root/core`                   | —      | E0        |
| **E2**  | ✅ Catalog : bump Zod 4 + Vitest 4          | (fait)                             | `root/deps`                   | —      | E1        |
| **E3**  | 🟡 Catalog : reste des versions + nettoyage | `migration-e3-catalog-alignement`  | `root/deps`                   | 0,5 j  | E2        |
| **E3b** | Les 4 majors, une PR chacune                | `migration-e3-major-<paquet>`      | `root/deps`                   | 0,5 j  | E3        |
| **E4**  | Presets partagés (ts / vitest / eslint)     | `migration-e4-presets-partages`    | `packages/config`             | 0,5 j  | E2        |
| **E5**  | Création de `@app/contracts`                | `migration-e5-contracts-init`      | `packages/contracts`          | 0,5 j  | E2        |
| **E6**  | Contrats : domaines API + bascule Zod       | `migration-e6-contracts-<domaine>` | `api/<domaine>`               | 2 j    | E5        |
| **E7**  | Conform → react-hook-form (`ui` d'abord)    | `migration-e7-rhf-<cible>`         | `ui/form`, `client/…`         | 2,5 j  | E3, E5    |
| **E8**  | Refonte structurelle `apps/api`             | `migration-e8-api-<domaine>`       | `api/<domaine>`               | 3 j    | E6        |
| **E9**  | Tests back : `__tests__` + couverture       | `migration-e9-tests-api`           | `api/tests`                   | 1 j    | E4, E8    |
| **E10** | Tests front : Vitest client + admin         | `migration-e10-tests-front`        | `client/tests`, `admin/tests` | 1,5 j  | E4, E7    |
| **E11** | Mutualisation front (`@app/web-kit`)        | `migration-e11-web-kit`            | `packages/web-kit`            | 1,5 j  | E7        |
| **E12** | Docs d'architecture                         | `migration-e12-docs-architecture`  | `root/docs`                   | 0,5 j  | E8        |

**Total ≈ 15,5 j** en séquentiel. E6, E7 et E8 se découpent eux-mêmes **par
domaine / par feature** — soit une PR par domaine, ce qui est le mode recommandé
(voir plans détaillés).

### Chemin critique

```
E1 → E2 → E5 → E6 → E8 → E9
       ↘ E3 → E7 → E10
       ↘ E4 ↗
```

E4 (presets) et E3 (catalog) peuvent avancer en parallèle de E5/E6 une fois E2
passée.

### Pilote

Migrer **`contact-messages`** de bout en bout (contrat → domain module →
use-cases éclatés → tests `__tests__`) **avant** de dérouler les 7 autres
domaines. C'est le domaine le plus simple : 10 fichiers, CRUD pur, ni queue ni
upload. Il sert de gabarit revu et validé.

---

## 5. Contenu des étapes transverses

Les étapes propres à une cible sont détaillées dans les plans dédiés.
Ci-dessous, seules celles qui touchent la racine.

### E1 — Socle racine & hygiène

1. `tsconfig.json` racine : `extends: "@app/typescript-config/base.json"`
   (retirer `expo/tsconfig.base`, reliquat mort d'une app mobile supprimée).
2. Renommer `check-types` → `typecheck` partout : racine, 5 `package.json`,
   `turbo.json`, `.github/workflows/test-ci.yml`, `.claude/hooks/typecheck.sh`,
   `CLAUDE.md`, `README.md`.
3. Runtimes : `engines.node: ">=24 <25"`, `.nvmrc` (`24`), `.npmrc`
   (`engine-strict=true`, `use-node-version=24.13.1`),
   `packageManager: pnpm@11.10.0`.
4. `turbo` et `prettier` au catalog (`turbo: 2.10.5`) +
   `minimumReleaseAgeExclude` sur les binaires turbo (comme la référence).
5. `turbo.json` : ajouter `db:seed`, `db:push`, `//#format-and-lint`, les
   `outputs` de `test`, et `dependsOn: ["^db:generate"]` sur `lint` /
   `typecheck`.
6. Trancher le style Prettier (§6).

### E2 — Bump Zod 4 + Vitest 4 — ✅ fait, voir §2.4

Étape à risque, isolée exprès. Elle **devait** précéder E5 (contrats) et E4
(presets de test).

L'estimation d'origine (17 fichiers `*.schema.ts` + les DTO API) s'est révélée
haute : `apps/api` valide avec `class-validator` et n'importe pas Zod, et les
motifs `errorMap`, `z.record(K, V)` et `.default()` sont absents du dépôt. Six
fichiers front ont suffi — détail dans §2.4.

`@conform-to/zod` reste installé jusqu'à E7 ; ses 31 imports pointent désormais
sur `@conform-to/zod/v4`. C'est une ligne par fichier, supprimée entièrement en
E7 : le coût du travail jetable redouté ici est nul, mais la recommandation
**d'enchaîner E7 directement après E3** reste valable pour ne pas laisser deux
bibliothèques de formulaires cohabiter.

### E3 — Alignement du reste du catalog — 🟡 partiellement fait

1. ✅ Les versions mineures restantes de §3.2.a.
2. 🔸 **Reporté en E3b.** Les majors se vérifient une par une, chacune avec un
   passage visuel : `lucide-react` 0.x → 1.x (renommages d'icônes), `sonner` 1 →
   2, `recharts` 2 → 3 (dashboard admin), `react-day-picker` 9 → 10.
3. ✅ **Catalogueriser** les dépendances de `apps/api` (24) et
   `packages/database` (6) épinglées en dur. Les mono-consommateur restent
   locales : la règle est « toute dep utilisée par ≥ 2 packages ».
4. ✅ Retirer `next`, `@next/eslint-plugin-next`, `@tailwindcss/postcss`,
   `postcss` — y compris le preset `eslint-config/next.js` et le
   `ui/postcss.config.js` qui les portaient.
5. ✅ Ajouter au catalog `@faker-js/faker`, `tiny-invariant`, `remix-utils`,
   `react-router-devtools`, `vitest-mock-extended`. L'outillage de test front
   attend E10 (§6).

**Vérifié** : `typecheck` (6/6) + `lint` (5/5) + `test` (188/188) +
`format:check` + **`build` (4/4)**. Le build est indispensable ici : `vite`,
`tailwindcss` et surtout `react-router` (7.9 → 7.18) bougent, et le typecheck
seul ne les couvre pas.

### E3b — Les quatre majors

Une PR par major, chacune avec une capture visuelle avant/après (§7) : ces
paquets cassent l'UI sans lever d'erreur TypeScript.

| Paquet             | De         | Vers      | Point de contrôle                     | État |
| ------------------ | ---------- | --------- | ------------------------------------- | ---- |
| `sonner`           | `^1.7.1`   | `^2.0.7`  | toasts client + admin                 | ✅   |
| `lucide-react`     | `^0.564.0` | `^1.21.0` | renommages d'icônes, toutes les pages | ✅   |
| `react-day-picker` | `9.13.2`   | `^10.0.1` | sélecteurs de date (publish, events)  | ✅   |
| `recharts`         | `2.15.0`   | `^3.9.0`  | dashboard admin (`/`)                 | 🔸   |

L'ordre est celui du risque croissant : `sonner` n'expose que deux méthodes,
`lucide-react` touche beaucoup de fichiers mais échoue franchement à l'import,
`react-day-picker` renomme des props, et `recharts` v3 refond son API alors que
tout le dashboard admin en dépend.

#### `sonner` 1 → 2 — ✅ fait

Surface réellement utilisée dans le dépôt :
`toast.success(msg, { description })` et `toast.error(msg, { description })` sur
41 sites d'appel, plus les props `position` / `richColors` / `closeButton` /
`toastOptions.classNames` du `<Toaster>` des deux `root.tsx`. Toutes inchangées
en v2, et la feuille de style reste auto-injectée par le paquet — aucun `import`
CSS à ajouter.

**Vérifié** : `typecheck` (6/6) + `lint` (5/5) + `test` (188/188) +
`format:check` + `build` (4/4), plus un montage jsdom jetable du `<Toaster>`
avec les props exactes de `apps/client/app/root.tsx`, confirmant le rendu du
titre, de la description, de `data-rich-colors`, du bouton de fermeture, de la
classe `font-sans` et des types `success` / `error`.

#### `lucide-react` 0.x → 1.x — ✅ fait

127 icônes distinctes sur 582 imports. Plutôt que de parcourir les écrans à
l'œil, les données SVG (`__iconNode`) des deux versions ont été comparées icône
par icône pour les 127 noms réellement importés. Le résultat tient en trois
groupes :

- **3 supprimées** — `Facebook`, `Instagram`, `Twitter`, toutes dans
  `apps/client/app/shared/components/footer.tsx`. La v1 retire l'intégralité des
  logos de marque pour raisons de marques déposées. Remplacées par
  `packages/ui/src/components/ui/brand-icons.tsx`, trois SVG inline sur le même
  `viewBox` 24×24 que lucide pour que le `className="h-4 w-4"` existant continue
  de fonctionner. L'occasion de passer l'ancien oiseau Twitter au vrai logo X.
- **7 au dessin modifié**, silencieuses car le nom reste valide :
  - `Ban` et `Clock` — seul l'ordre des éléments SVG change, rendu identique ;
  - `Calendar` et `CalendarDays` — géométrie décalée d'un pixel (cadre `y` 4→3,
    barre d'en-tête 10→9), imperceptible ;
  - `Gift`, `PackageCheck` et `Zap` — réellement redessinées, à regarder.
- **117 inchangées**.

**Vérifié** : `typecheck` (6/6) + `lint` (5/5) + `test` (188/188) +
`format:check` + `build` (4/4).

#### `react-day-picker` 9 → 10 — ✅ fait

La v10 ne fait que retirer les compatibilités héritées de la v8 : l'enum `UI`,
les exports racine et les clés de `classNames` sont sinon identiques.
Comparaison des `.d.ts` des deux versions — les props disparues sont `fromDate`
/ `toDate` / `fromMonth` / `toMonth` / `fromYear` / `toYear`, `initialFocus`,
`onWeekNumberClick`, les huit handlers `onDay*` (clavier, pointeur, tactile),
les formatters `formatMonthCaption` / `formatYearCaption`, le label `labelDay`,
le composant surchargeable `Button` et les types `DeprecatedUI` /
`V9DeprecatedProps`. Côté entrypoints, `./jalali`, `./persian`, `./buddhist`,
`./hebrew`, `./ethiopic` et `./examples` sont retirés, avec les locales `am-ET`,
`en-US-jalali` et `fa-IR-jalali` — aucun n'est importé ici, le `fr` du dépôt
venant de `date-fns/locale`. Deux ajouts, tous deux additifs : `resetOnSelect`
(apparu en 9.14, non passé donc comportement de plage inchangé) et un `style`
optionnel sur `Chevron`.

Deux corrections seulement, pour une v10 qui touche très peu ce dépôt :

- `initialFocus` sur le `<Calendar>` de
  `apps/admin/app/shared/components/date-range-picker.tsx` — unique occurrence
  de toute la liste ci-dessus, et déjà sans effet en v9, donc suppression
  neutre.
- la clé `table` de `classNames` dans
  `packages/ui/src/components/ui/calendar.tsx` était une clé `DeprecatedUI`
  (renommée `month_grid` dès la v9), et la disparition du type en v10 la
  transforme en erreur de typage. À vérifier dans les sources des deux versions,
  `MonthGrid` est rendu avec `classNames[UI.MonthGrid]` en v9 **comme** en v10 :
  `table` n'était jamais lue, et son `w-full border-collapse` n'a donc jamais
  atteint le DOM. Aligné sur ce que shadcn livre aujourd'hui en amont —
  `month_grid: cn('w-full border-collapse', defaultClassNames.month_grid)` — ce
  qui active enfin le style voulu. C'est le seul changement de rendu de la PR,
  et il reste à confirmer à l'œil.

Les deux seuls consommateurs de `<Calendar>` (celui de l'admin ci-dessus et
`apps/client/app/features/lost-items/list/components/filter-panel.tsx`)
n'utilisent que `mode="range"`, `selected`, `onSelect`, `disabled`, `locale`,
`numberOfMonths` et `defaultMonth`, tous conservés en v10.

**Vérifié** : `typecheck` (6/6) + `lint` (5/5) + `test` (188/188) +
`format:check` + `build` (4/4), plus un rendu jetable du `<Calendar>`
reproduisant les props exactes des deux appelants (18 assertions) : présence de
`w-full border-collapse` **et** de `rdp-month_grid` sur la `<table>`,
`role="grid"` conservé, `numberOfMonths` respecté (2 grilles côté admin, 1 côté
client), plage `range_start` / `range_middle` / `range_end` rendue,
`disabled={{ after }}` appliqué, locale `fr` effective (`aria-label="lundi"` →
`"dimanche"`, semaine démarrant le lundi, libellé de mois « juillet ») et les
quatre composants surchargés bien en place (`data-slot="calendar"`, chevron
lucide, `data-day`).

### E12 — Docs d'architecture

Créer `docs/architecture/` sur le modèle de la référence : vue d'ensemble,
architecture applicative, flux métier (annonces / matching / QR), exploitation &
DevOps. `docs/README.md` en index.

---

## 6. Décisions à arbitrer

| Sujet                    | Options                                                                                                 | Recommandation                                                                                                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Style Prettier**       | ✅ **tranché en E1 : (b)** — on garde `useTabs: true` / `printWidth: 80`, divergence documentée en §3.7 | (b) — un reformatage global noie tous les diffs de la migration et casse `git blame`. À refaire après E12 en commit isolé + `.git-blame-ignore-revs`.                                                                                                                                                 |
| **Ordre E7 / E2**        | migrer Conform vers `@conform-to/zod/v4` puis vers RHF, ou enchaîner E7 juste après E3                  | **enchaîner E7** — évite une migration jetable sur 41 fichiers                                                                                                                                                                                                                                        |
| **Tests front**          | browser mode (`@vitest/browser-playwright`, comme la référence) ou `jsdom`                              | **browser mode** pour rester aligné, mais coût CI plus élevé. E2 laisse `jsdom` en place : la bascule se fait en **E10**, avec les presets E4 et les premiers tests front — installer une chaîne Playwright en CI pour zéro test n'a pas de sens, et l'outillage correspondant relève du catalog d'E3 |
| **`@app/web-kit` (E11)** | mutualiser client ↔ admin, ou assumer la duplication                                                   | mutualiser — 5 fichiers strictement identiques aujourd'hui                                                                                                                                                                                                                                            |

---

## 7. Risques et garde-fous

| Risque                                                                    | Mitigation                                                                                |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Bump Zod 3 → 4 casse la validation front et back                          | E2 isolée, aucune autre modification dans la PR, revue des 17 schémas un par un           |
| Migration Conform → RHF régresse silencieusement sur des formulaires      | `packages/ui` d'abord, puis une PR par feature, avec passage manuel sur chaque formulaire |
| Majors `lucide-react` / `sonner` / `recharts` cassent l'UI sans erreur TS | E3 découpée en une PR par major, avec capture visuelle avant/après                        |
| Renommages `infrastructure` → `infrastructures` cassent des imports muets | Un commit par renommage + `typecheck` obligatoire entre chaque                            |
| Éclatement des use-cases régresse                                         | Écrire les tests **avant** l'éclatement — les 30 `*.spec.ts` servent de filet             |
| DTO `class-validator` et schémas Zod coexistent trop longtemps            | Un domaine n'est « fini » que quand son DTO est supprimé — jamais de double validation    |
| Features désactivées (`stickers`, `orders`, `qr-contact`) dérivent        | Les exclure aussi des migrations, ou les réactiver d'abord — pas d'entre-deux             |
| Contexte de session saturé sur une longue étape                           | Découper par domaine / feature ; message de passation systématique                        |

---

## 8. Définition de « conforme »

Une PR de migration est acceptable quand, pour son périmètre :

- [ ] `pnpm run typecheck && pnpm run lint && pnpm run test && pnpm run format:check`
      passent
- [ ] aucun fichier ne viole l'arbre cible de `backend-conventions` /
      `frontend-conventions`
- [ ] aucun schéma de validation dupliqué entre front et back
- [ ] aucun `fetch` hors `servers/` (ou exception documentée dans `CLAUDE.md`)
- [ ] tests dans `__tests__/<name>.test.ts`, comportement testé et non
      implémentation
- [ ] toute dépendance utilisée par ≥ 2 packages est dans le catalog pnpm
- [ ] tous les packages sont scopés `@app/*`
- [ ] commit conventionnel avec scope `api/<domaine>`, `client/<feature>`,
      `admin/<feature>`, `packages/<nom>` ou `root/<sujet>` (cf. `AGENTS.md`)
- [ ] PR ouverte via `gh`, après accord explicite pour le commit
- [ ] message de passation rédigé pour l'étape suivante
