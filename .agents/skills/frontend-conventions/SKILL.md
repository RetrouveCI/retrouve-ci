---
name: frontend-conventions
description: Structure et règles front-end React + React Router v7 (architecture Feature-based). À utiliser pour créer ou modifier du code front — features, components, hooks, mappers, validators, et la couche servers (service/loader/action) — ou pour savoir où placer un fichier front.
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
│       │   └── *.actions.ts   # Mutations (React Router v7)
│       ├── *.validators.ts    # Schémas zod (form + action server)
│       ├── *.types.ts         # Types propres à la feature
│       ├── *.const.ts         # Constantes locales
│       └── index.tsx           # la page principale de la feature (exporte le routeur React Router v7)
└── shared/
    ├── components/  # Composants réutilisables entre features
    ├── hooks/       # Hooks réutilisables entre features
    ├── types/       # Types partagés entre features
    ├── constants/   # Constantes partagées entre features
    └── utils/       # Utilitaires techniques génériques
```

## `servers/` — Couche data

Toute interaction back-end (API, loaders, mutations) est isolée ici. **Aucun `fetch` en dehors de ce dossier.**

- `*.service.ts` : appels HTTP via le client API.
- `*.loader.ts` : loaders React Router v7.
- `*.actions.ts` : mutations React Router v7 ; valident l'input avec le schéma `zod` de la feature avant l'appel service.

Un hook ne fait jamais d'appel HTTP directement — il utilise les fonctions de `servers/`.

## `mappers/`

Transforment les réponses API (DTO) en ViewModels prêts pour l'affichage. Un composant reçoit un **ViewModel**, jamais un DTO brut.

## `*.validators.ts`

Schémas `zod` partagés entre le formulaire React (client) et les `*.actions.ts` (server). Symétriques aux `validators/` du domaine back-end.

## Règles d'or

- ❌ Pas de `fetch` direct dans un composant ou un hook → passer par `servers/*.service.ts`.
- ❌ Pas de logique de transformation dans un composant → utiliser un `mapper`.
- ❌ Type/composant partagé déclaré dans une feature → le déplacer dans `shared/types` ou `shared/components`.
- ✅ La validation est partagée entre formulaire client et action server.

## Conventions de nommage

| Élément    | Convention                | Exemple                      |
| ---------- | ------------------------- | ---------------------------- |
| Composants | `kebab-case.tsx`          | `transaction-card.tsx`       |
| Hooks      | `camelCase` préfixé `use` | `useTransactionFilters.ts`   |
| Services   | `[feature].service.ts`    | `transactions.service.ts`    |
| Loaders    | `[feature].loader.ts`     | `transactions.loader.ts`     |
| Actions    | `[feature].actions.ts`    | `transactions.actions.ts`    |
| Validators | `[feature].validators.ts` | `transactions.validators.ts` |
| Mappers    | `[entity].mapper.ts`      | `transaction.mapper.ts`      |
| Types      | `[feature].types.ts`      | `transactions.types.ts`      |
| Constantes | `[feature].const.ts`      | `transactions.const.ts`      |

## Où créer mes fichiers ?

| Situation                      | Chemin cible                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| Nouvelle page / fonctionnalité | `features/[feature-name]/` (components, hooks, servers, mappers, \*.types/const/validators) |
| Composant réutilisable         | `shared/components/[component-name].tsx`                                                    |
| Hook réutilisable              | `shared/hooks/use[HookName].ts`                                                             |
| Types partagés                 | `shared/types/[type-name].ts`                                                               |
| Utilitaire technique           | `shared/utils/[util-name].ts`                                                               |
