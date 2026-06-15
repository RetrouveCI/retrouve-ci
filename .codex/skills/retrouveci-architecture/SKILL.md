---
name: retrouveci-architecture
description:
  Conventions d'architecture pour les apps RetrouveCI — backend NestJS en
  Domain-Driven/Clean Architecture et frontend React Router v7 en feature-based.
  Utilise CE SKILL chaque fois que tu écris, déplaces, refactorises, ou
  organises du code dans le repo RetrouveCI (admin, client ou api), que tu crées
  un nouveau module/feature, un use-case, un controller, un service, une page,
  un loader/action, ou que tu migres du code depuis l'ancienne structure
  Next.js. Déclenche-toi aussi quand l'utilisateur mentionne "RetrouveCI",
  "domains/", "infra/", "presentation/", "features/", "servers/", ou pose une
  question du type "où je mets ce fichier ?" / "comment organiser ce module ?".
---

# Architecture RetrouveCI

Ce skill définit la structure de référence pour le **monorepo Turborepo
RetrouveCI** (plateforme de lost & found basée sur QR codes). Il couvre à la
fois le backend **`apps/api`** (NestJS v11, Domain-Driven + Clean Architecture)
et les frontends **`apps/client`** / **`apps/admin`** (React Router v7,
anciennement Next.js).

## Contexte projet

- **Backend** (`apps/api`) : NestJS v11, PostgreSQL/Prisma v7, organisation
  **module-first** (Domain-Driven + Clean Architecture **par feature module**)
- **Frontend** (`apps/client`, `apps/admin`) : React Router v7, feature-based,
  composants en **kebab-case**
- **Code partagé** : `packages/` (ex: `packages/ui`, `packages/api-client`,
  `packages/shared`)
- **Domaine métier** : objets perdus/retrouvés, QR codes, utilisateurs,
  notifications, matching

Avant toute action, identifie dans quel projet tu te trouves (`apps/api`,
`apps/client`, `apps/admin`, ou `packages/`) et applique la structure
correspondante ci-dessous.

---

## Backend (NestJS) — `backend-architecture/Skill.md`

Structure DDD/Clean Architecture **par feature module** (`src/[feature]/`), en 3
zones internes : `domains/`, `infra/`, `presentation/`, plus deux zones
transversales au niveau de `src/` : `libs/` (wrappers de libs externes) et
`shared/` (helpers/types non-métier).

**Lis `backend-architecture/Skill.md`** dès que tu :

- crées un nouveau module métier (ex: `lost-items`, `qr-codes`, `users`,
  `matching`, `notifications`)
- ajoutes un use-case, un repository, un mapper, un validator
- crées un controller, un worker, ou un consumer de queue
- te demandes où placer un helper, un type, ou un wrapper de lib externe

## Frontend (React Router v7) — `frontend-architecture/Skill.md`

Structure feature-based avec couche `servers/` pour loaders/actions/services.
**Tous les fichiers composants sont en kebab-case** (ex: `lost-item-card.tsx`).

**Lis `frontend-architecture/Skill.md`** dès que tu :

- crées une nouvelle feature/page (admin ou client)
- migres une page Next.js (`app/`) vers RRv7
- ajoutes un composant, un hook, un loader, une action
- te demandes où placer un type partagé ou un composant réutilisable

## Migration Next.js → React Router v7

Pas encore de référence dédiée. En attendant, applique la structure
`frontend-architecture/Skill.md` : extraire les types (`*.types.ts`),
transformer `getServerSideProps`/route handlers en `*.loader.ts`/`*.actions.ts`,
et restructurer `app/` en `features/[feature-name]/` avec composants kebab-case.

---

## Règles transversales (toujours actives)

1. **Ne jamais mettre de logique métier dans `presentation/` (back) ou dans les
   `components/` (front)** — toujours déléguer à `domains/use-cases/` ou
   `servers/`.
2. **Toute lib externe critique** (mailer, QR generation, storage, notifications
   push, Better Auth, BullMQ) doit être wrappée dans `src/libs/` (back) avant
   utilisation dans `infra/`.
3. **Un helper spécifique à un domaine métier** (ex: calcul de matching score,
   génération de référence QR) va dans `[feature]/domains/helpers/`, jamais dans
   `shared/`.
4. **Front** : aucun `fetch`/`axios` hors de `servers/` — les composants
   reçoivent toujours un ViewModel mappé, jamais un DTO brut.
5. **Nommage** : `[entity].[type].ts` partout (ex: `lost-item.repository.ts`,
   `lost-items.loader.ts`, `qr-code.mapper.ts`) ; composants front en
   **kebab-case** (ex: `lost-item-card.tsx`).

Quand une question d'organisation se pose et qu'aucune règle ci-dessus ne répond
clairement, propose une option et demande confirmation avant de créer un nouveau
pattern.
