---
name: frontend-conventions
description: Structure et règles front-end React + React Router v7 (architecture Feature-based). À utiliser pour créer ou modifier du code front — features, components, hooks, mappers, schémas, et la couche servers (service/loader/action) — ou pour savoir où placer un fichier front.
---

# Front-end — Feature-based (React Router v7)

Chaque fonctionnalité est un module autonome sous `features/`. Tout ce qui est réutilisé entre features va dans `shared/`.

```
src/
├── features/
│   └── [feature-name]/
│       ├── components/        # Composants UI locaux à la feature (kebab-case.tsx)
│       ├── hooks/             # Hooks UI locaux (use-*.ts)
│       ├── mappers/           # DTO API → ViewModel
│       ├── servers/           # Couche data — SEUL endroit avec des fetch
│       │   ├── *.service.ts   # Appels HTTP
│       │   ├── *.loader.ts    # Chargement de données (React Router v7)
│       │   └── *.action.ts    # Mutations (React Router v7)
│       ├── types/             # Types propres à la feature ([feature].types.ts)
│       ├── *.const.ts         # Constantes locales
│       └── _index.tsx          # la page principale de la feature (exporte le routeur React Router v7)
└── shared/
    ├── components/  # Composants réutilisables entre features
    ├── hooks/       # Hooks réutilisables entre features
    ├── types/       # Types partagés entre features
    ├── constants/   # Constantes partagées entre features
    └── utils/       # Utilitaires techniques génériques
```

## `servers/` — Couche data

Toute interaction back-end (API, loaders, mutations) est isolée ici. **Aucun `fetch` en dehors de ce dossier.**

- `*.service.ts` : appels HTTP via le client API — une fonction `apiFetch(request, path, init)` qui exécute **une** requête (forward de la session, gestion d'erreur `ApiError`).
- `*.loader.ts` : loaders React Router v7.
- `*.action.ts` : mutations React Router v7 ; valident l'input avec le schéma `zod` du package de contrats partagé avant l'appel service.

> Nommage du client API : `*Fetch` = **fonction** qui exécute une requête ; `*Client` = **objet à méthodes** (réservé aux SDK, ex. client d'auth). Le client API maison est donc `apiFetch`, pas `apiClient`.

Un hook ne fait jamais d'appel HTTP directement — il utilise les fonctions de `servers/`.

## `mappers/`

Transforment les réponses API (DTO) en ViewModels prêts pour l'affichage. Un composant reçoit un **ViewModel**, jamais un DTO brut.

## Schémas de validation — package de contrats partagé

Les schémas `zod` ne vivent **pas** dans la feature : ils sont dans un **package de contrats partagé** (un fichier `*.schema.ts` par domaine), importé à la fois par le formulaire React (client) et par les `*.action.ts` (server), et par le back-end (pipe de validation Zod des controllers). C'est la **source unique de vérité de validation, partagée front + back** — d'où l'absence de `*.validators.ts` local à la feature.

## `types/`

Les types propres à une feature vivent dans un sous-dossier `types/` de la feature, fichier `[feature].types.ts` (variantes wire `*ApiDto` incluses). Les types réutilisés entre plusieurs features vont dans `shared/types/`.

## Règles d'or

- ❌ Pas de `fetch` direct dans un composant ou un hook → passer par `servers/*.service.ts`.
- ❌ Pas de logique de transformation dans un composant → utiliser un `mapper`.
- ❌ Type/composant partagé déclaré dans une feature → le déplacer dans `shared/types` ou `shared/components`.
- ✅ La validation est partagée entre formulaire client et action server via le package de contrats partagé.

## Conventions de nommage

| Élément    | Convention                            | Exemple                            |
| ---------- | ------------------------------------- | ---------------------------------- |
| Composants | `kebab-case.tsx`                      | `transaction-card.tsx`             |
| Hooks      | `camelCase` préfixé `use`             | `useTransactionFilters.ts`         |
| Services   | `[feature].service.ts`                | `transactions.service.ts`          |
| Loaders    | `[feature].loader.ts`                 | `transactions.loader.ts`           |
| Actions    | `[feature].action.ts`                 | `transactions.action.ts`           |
| Schémas    | `[domaine]/*.schema.ts` (package de contrats) | `alerts/alert-status.schema.ts` |
| Mappers    | `[entity].mapper.ts`                  | `transaction.mapper.ts`            |
| Types      | `types/[feature].types.ts`            | `types/transactions.types.ts`      |
| Constantes | `[feature].const.ts`                  | `transactions.const.ts`            |

## Où créer mes fichiers ?

| Situation                      | Chemin cible                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Nouvelle page / fonctionnalité | `features/[feature-name]/` (components, hooks, servers, mappers, types, \*.const) |
| Schéma de validation           | package de contrats partagé — `[domaine]/*.schema.ts` (partagé front + back)      |
| Composant réutilisable         | `shared/components/[component-name].tsx`                                          |
| Hook réutilisable              | `shared/hooks/use[HookName].ts`                                                   |
| Types partagés                 | `shared/types/[type-name].ts`                                                     |
| Utilitaire technique           | `shared/utils/[util-name].ts`                                                     |
