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

Ce skill définit la structure de référence pour les applications RetrouveCI
(plateforme de lost & found basée sur QR codes, Wiserve Group). Il s'applique au
**backend NestJS** et aux **frontends React Router v7** (admin + client), en
cours de migration depuis Next.js.

## Contexte projet

- **Backend** : NestJS, PostgreSQL, microservices/modules (Domain-Driven + Clean
  Architecture)
- **Frontend** : React Router v7 (anciennement Next.js — admin + client),
  feature-based
- **Domaine métier** : objets perdus/retrouvés, QR codes, utilisateurs,
  notifications, matching

Avant toute action, identifie dans quel projet tu te trouves (backend NestJS ou
frontend RRv7) et applique la structure correspondante ci-dessous.

---

## Backend (NestJS) — `references/backend.md`

Structure DDD/Clean Architecture en 5 zones : `domains/`, `infra/`,
`presentation/`, `libs/`, `shared/`.

**Lis `references/backend.md`** dès que tu :

- crées un nouveau module métier (ex: `lost-items`, `qr-codes`, `users`,
  `matching`)
- ajoutes un use-case, un repository, un mapper, un validator
- crées un controller, un worker, ou un consumer de queue
- te demandes où placer un helper ou un type

## Frontend (React Router v7) — `references/frontend.md`

Structure feature-based avec couche `servers/` pour loaders/actions/services.

**Lis `references/frontend.md`** dès que tu :

- crées une nouvelle feature/page (admin ou client)
- migres une page Next.js (`app/` ou `pages/`) vers RRv7
- ajoutes un composant, un hook, un loader, une action
- te demandes où placer un type partagé ou un composant réutilisable

## Migration Next.js → React Router v7 — `references/migration.md`

**Lis `references/migration.md`** dès que tu :

- migres une page ou un composant existant depuis Next.js
- dois transformer un `getServerSideProps`/Route Handler en `loader`/`action`
- restructures un dossier `app/` ou `pages/` Next.js en `features/`

---

## Règles transversales (toujours actives)

1. **Ne jamais mettre de logique métier dans `presentation/` (back) ou dans les
   `components/` (front)** — toujours déléguer à `domains/use-cases/` ou
   `servers/`.
2. **Toute lib externe critique** (mailer, QR generation, storage, notifications
   push) doit être wrappée dans `libs/` (back) avant utilisation dans `infra/`.
3. **Un helper spécifique à un domaine métier** (ex: calcul de matching score,
   génération de référence QR) va dans `domains/[module]/helpers/`, jamais dans
   `shared/`.
4. **Front** : aucun `fetch`/`axios` hors de `servers/` — les composants
   reçoivent toujours un ViewModel mappé, jamais un DTO brut.
5. **Nommage** : `[entity].[type].ts` partout (ex: `lost-item.repository.ts`,
   `lost-items.loader.ts`, `qr-code.mapper.ts`).

Quand une question d'organisation se pose et qu'aucune règle ci-dessus ne répond
clairement, propose une option et demande confirmation avant de créer un nouveau
pattern.
