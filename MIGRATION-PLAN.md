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

---

## 3. État des lieux — écarts restants

### 3.1 Racine du monorepo

| Sujet            | RetrouveCI                               | Référence                                              | Écart                      |
| ---------------- | ---------------------------------------- | ------------------------------------------------------ | -------------------------- |
| Script typecheck | `check-types`                            | `typecheck`                                            | 🔸 nommage                 |
| `tsconfig.json`  | `extends: "expo/tsconfig.base"`          | `extends: "@app/typescript-config/base.json"`          | 🔴 **bug** — reliquat Expo |
| Node             | `>=18`, pas de `.nvmrc`                  | `>=24 <25`, `.nvmrc`, `use-node-version` dans `.npmrc` | 🔸                         |
| pnpm             | `11.9.0`                                 | `11.10.0`                                              | 🔸                         |
| Turbo            | `^2.9.6`, hors catalog                   | `2.10.5`, dans le catalog                              | 🔸                         |
| `turbo.json`     | `globalEnv` (24 vars), tâches partielles | tâches `test` / `db:*` / `typecheck` complètes         | 🔸                         |
| Prettier         | `useTabs: true`, `printWidth: 80`        | espaces (2), `printWidth: 85`                          | 🟠 divergence de style     |
| Docs archi       | aucune                                   | `docs/architecture/*.md` (5 docs)                      | 🔸                         |

### 3.2 Dépendances — catalog pnpm

Le catalog est la source de vérité (skill `dependency-management`). Trois
problèmes :

**a) 27 versions divergentes** de la référence, dont trois structurantes :

| Package                                   | RetrouveCI | Référence  | Impact                                  |
| ----------------------------------------- | ---------- | ---------- | --------------------------------------- |
| `zod`                                     | `^3.24.1`  | `^4.4.3`   | 🔴 bloque le package de contrats        |
| `vitest` / `@vitest/coverage-v8`          | `^3.2.4`   | `^4.1.9`   | 🔴 bloque les presets de test partagés  |
| `typescript`                              | `5.9.2`    | `^6.0.3`   | 🟠 à faire après le reste               |
| `react-hook-form`                         | `^7.54.1`  | `7.71.1`   | requis par la migration des formulaires |
| `@hookform/resolvers`                     | `^3.9.1`   | `5.2.2`    | idem (API `standardSchemaResolver`)     |
| `react` / `react-dom`                     | `19.2.4`   | `^19.2.7`  | mineur                                  |
| `react-router` (+ `dev`, `node`, `serve`) | `^7.9.5`   | `7.12.0`   | mineur                                  |
| `lucide-react`                            | `^0.564.0` | `^1.21.0`  | 🟠 major — vérifier les noms d'icônes   |
| `sonner`                                  | `^1.7.1`   | `^2.0.7`   | 🟠 major                                |
| `recharts`                                | `2.15.0`   | `^3.9.0`   | 🟠 major — dashboard admin              |
| `react-day-picker`                        | `9.13.2`   | `^10.0.1`  | 🟠 major                                |
| `tailwindcss` + `@tailwindcss/vite`       | `^4.2.0`   | `^4.3.1`   | mineur                                  |
| `@types/node`                             | `^22`      | `^24.13.2` | suit le bump Node                       |

Restent mineurs : `date-fns`, `eslint`, `isbot`, `vite`, `@vitejs/plugin-react`,
`@types/react`, `@types/react-dom`, `vite-tsconfig-paths`.

**b) Dépendances hors catalog** — `apps/api` épingle en dur `@nestjs/*`,
`prisma`, `@prisma/client`, `pg`, `bullmq`, `class-validator`,
`class-transformer`, `better-auth`, `dotenv`… alors que la référence les a
toutes au catalog. Idem `packages/database`.

**c) Dépendances à retirer** : `next`, `@next/eslint-plugin-next`,
`@tailwindcss/postcss`, `postcss` (plus aucune app Next), et
`@conform-to/react` + `@conform-to/zod` (voir §3.4).

> `prisma` / `@prisma/client` sont en **7.8.0** ici contre **7.4.0** dans la
> référence : RetrouveCI est en avance, on **ne rétrograde pas**.

**Absents du catalog RetrouveCI et utiles à la cible** : `@faker-js/faker`
(seeds/fixtures), `tiny-invariant`, `remix-utils`, `react-router-devtools`,
`@vitest/browser-playwright`, `playwright`, `vitest-browser-react`,
`vitest-mock-extended` (tests front), `prettier` et `turbo` (à catalogueriser).

### 3.3 Packages

| Package de référence                                            | Équivalent RetrouveCI | Écart                                            |
| --------------------------------------------------------------- | --------------------- | ------------------------------------------------ |
| `<produit>-database`                                            | `@app/database`       | ✅ équivalent                                    |
| `@app/ui`                                                       | `@app/ui`             | 🔸 dépend de Conform (`components/form/`)        |
| `@app/eslint-config`                                            | idem                  | 🔸 preset `next-js` obsolète, manque `nest`      |
| `@app/typescript-config`                                        | idem                  | 🔸 manque `react-router.json` et `nest.json`     |
| `@app/vitest-config`                                            | idem                  | 🔸 manque le preset `node` (SWC/decorators Nest) |
| **`<produit>-contracts`**                                       | **absent**            | 🔴 **manquant** — pas de source de vérité Zod    |
| `@app/auth`, `@app/permissions`, `@app/transactional`           | absents               | 🔸 selon besoin (voir plan packages)             |
| `@app/encryption`, `branding`, `business-calendar`, `ldap-auth` | absents               | ⚪ non pertinents                                |

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
- **Style Prettier** : à trancher en E1 (voir §6).

---

## 4. Découpage en étapes

Une ligne = une branche = une PR = une session.

| #       | Étape                                    | Branche                            | Scope commit                  | Charge | Dépend de |
| ------- | ---------------------------------------- | ---------------------------------- | ----------------------------- | ------ | --------- |
| **E0**  | ✅ Scope `@app/*` + outillage agents     | (fait)                             | `root/tooling`                | —      | —         |
| **E1**  | Socle racine & hygiène                   | `migration-e1-socle-racine`        | `root/core`                   | 0,5 j  | E0        |
| **E2**  | Catalog : bump Zod 4 + Vitest 4          | `migration-e2-catalog-zod-vitest`  | `root/deps`                   | 1 j    | E1        |
| **E3**  | Catalog : reste des versions + nettoyage | `migration-e3-catalog-alignement`  | `root/deps`                   | 1 j    | E2        |
| **E4**  | Presets partagés (ts / vitest / eslint)  | `migration-e4-presets-partages`    | `packages/config`             | 0,5 j  | E2        |
| **E5**  | Création de `@app/contracts`             | `migration-e5-contracts-init`      | `packages/contracts`          | 0,5 j  | E2        |
| **E6**  | Contrats : domaines API + bascule Zod    | `migration-e6-contracts-<domaine>` | `api/<domaine>`               | 2 j    | E5        |
| **E7**  | Conform → react-hook-form (`ui` d'abord) | `migration-e7-rhf-<cible>`         | `ui/form`, `client/…`         | 2,5 j  | E3, E5    |
| **E8**  | Refonte structurelle `apps/api`          | `migration-e8-api-<domaine>`       | `api/<domaine>`               | 3 j    | E6        |
| **E9**  | Tests back : `__tests__` + couverture    | `migration-e9-tests-api`           | `api/tests`                   | 1 j    | E4, E8    |
| **E10** | Tests front : Vitest client + admin      | `migration-e10-tests-front`        | `client/tests`, `admin/tests` | 1,5 j  | E4, E7    |
| **E11** | Mutualisation front (`@app/web-kit`)     | `migration-e11-web-kit`            | `packages/web-kit`            | 1,5 j  | E7        |
| **E12** | Docs d'architecture                      | `migration-e12-docs-architecture`  | `root/docs`                   | 0,5 j  | E8        |

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

### E2 — Bump Zod 4 + Vitest 4

Étape à risque, isolée exprès. Elle **doit** précéder E5 (contrats) et E4
(presets de test).

1. `zod: ^4.4.3` au catalog. Corriger les schémas existants :
   `z.string().email()` → `z.email()`, `errorMap` → `error`, `z.record(K, V)` à
   deux arguments, `.default()` qui n'élargit plus le type d'entrée. 17 fichiers
   `*.schema.ts` + les DTO API concernés.
2. `vitest: ^4.1.9` + `@vitest/coverage-v8: ^4.1.9`. Vérifier les 30 fichiers de
   test API.
3. `react-hook-form: 7.71.1` + `@hookform/resolvers: 5.2.2` (préparent E7).
4. Ajouter `jsdom` ou basculer sur le browser mode selon la décision d'E10.

> `@conform-to/zod` reste installé jusqu'à E7 ; sa v1.19 gère Zod 4 via
> `@conform-to/zod/v4` — l'import doit être adapté dans les 41 fichiers
> concernés **ou** E7 doit être menée juste après E2 pour éviter ce travail
> jetable. **Recommandé : enchaîner E7 directement après E3**, et ne pas payer
> la double migration Conform.

### E3 — Alignement du reste du catalog

1. Les versions mineures restantes de §3.2.a.
2. Les majors à vérifier une par une, chacune avec un passage visuel :
   `lucide-react` 0.x → 1.x (renommages d'icônes), `sonner` 1 → 2, `recharts` 2
   → 3 (dashboard admin), `react-day-picker` 9 → 10.
3. **Catalogueriser** toutes les dépendances de `apps/api` et
   `packages/database` aujourd'hui épinglées en dur (règle : toute dep utilisée
   par ≥ 2 packages va au catalog).
4. Retirer `next`, `@next/eslint-plugin-next`, `@tailwindcss/postcss`,
   `postcss`.
5. Ajouter au catalog ce qui manque pour la cible (`@faker-js/faker`,
   `tiny-invariant`, `remix-utils`, `react-router-devtools`, outillage de test
   front).

### E12 — Docs d'architecture

Créer `docs/architecture/` sur le modèle de la référence : vue d'ensemble,
architecture applicative, flux métier (annonces / matching / QR), exploitation &
DevOps. `docs/README.md` en index.

---

## 6. Décisions à arbitrer

| Sujet                    | Options                                                                                                | Recommandation                                                                                                                                            |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Style Prettier**       | (a) aligner sur la référence (espaces, 85 col) → reformatage global ; (b) garder tabs/80 et documenter | **(b)** — un reformatage global noie tous les diffs de la migration et casse `git blame`. À refaire plus tard en commit isolé + `.git-blame-ignore-revs`. |
| **Ordre E7 / E2**        | migrer Conform vers `@conform-to/zod/v4` puis vers RHF, ou enchaîner E7 juste après E3                 | **enchaîner E7** — évite une migration jetable sur 41 fichiers                                                                                            |
| **Tests front**          | browser mode (`@vitest/browser-playwright`, comme la référence) ou `jsdom`                             | **browser mode** pour rester aligné, mais coût CI plus élevé                                                                                              |
| **`@app/web-kit` (E11)** | mutualiser client ↔ admin, ou assumer la duplication                                                  | mutualiser — 5 fichiers strictement identiques aujourd'hui                                                                                                |

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
