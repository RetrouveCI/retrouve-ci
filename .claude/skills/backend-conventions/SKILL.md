---
name: backend-conventions
description: Structure et règles back-end NestJS (DDD + Clean Architecture). À utiliser pour créer ou modifier du code back-end — use-cases, controllers, repositories, services infra, mappers, errors — ou pour savoir dans quelle couche placer un fichier.
---

# Back-end — DDD + Clean Architecture

L'architecture back-end est organisée en 4 zones à responsabilités distinctes sous `src/`.

```
src/
├── domains/        # ❤️ Logique métier
├── infrastructures/          # 🔌 Implémentations concrètes et services tiers (DB, APIs externes, minio, stripe...)
├── presentations/   # 🚪 Points d'entrée (HTTP, queues, workers)
└── shared/         # 🔧 Utilitaires et types transversaux (non-métier)
```

## `domains/` — Logique métier

```
domains/
├── repository/    # Interfaces d'accès aux données
├── mappers/       # Transformation entité ↔ DTO
├── use-cases/     # Cas d'usage métier (commandes / queries)
├── helpers/       # Fonctions utilitaires fonctionnelles qui se limitent au domaine (pures)
├── types/         # Types partagés au sein du domaine
├── errors/        # Classes d'erreurs métier (étendent DomainError)
└── *.const.ts     # Constantes métier
    *.module.ts     # Module NestJS du domaine
```

- ❌ Aucune dépendance vers `presentations/`.
- ✅ Les `use-cases` orchestrent : `repository` + `mappers` (+ `helpers`).
- ℹ️ Pas de couche `validators/` dans le domaine : les schémas de validation `zod`
  vivent dans le **package de contrats partagé** (`[domaine]/*.schema.ts`), la même
  source de vérité que le front (voir `frontend-conventions`).
- ✅ Les `errors/` étendent une classe de base commune (`DomainError`).
- ✅ Chaque domaine doit être un module NestJS indépendant

## `infrastructures/` — Services externes

```
infrastructures/
├── *.config.ts    # Configuration des services externes
└── *.service.ts   # Implémentation des repositories et services
```

- ✅ Toujours implémenter une interface déclarée dans `domains/`.
- ✅ Un fichier `.config.ts` par service externe.
- ❌ Jamais de logique métier ici — uniquement de l'accès aux données.

## `presentations/` — Points d'entrée

```
presentations/
  <feature-name>/
    ├── controllers/      # Endpoints HTTP (REST) — si plusieurs controllers
    ├── services/         # Orchestration transverse de présentation (composition notifications/emails autour d'use-cases)
    ├── workers/          # Traitements de fond (crons, schedulers)
    └── queue-consumers/  # Consommateurs de messages (BullMQ)
```

- ✅ Les controllers **délèguent** aux `use-cases` — rien de plus.
- ✅ **Un seul controller → fichier à plat** à la racine de la feature (`[feature].controller.ts`) ; le sous-dossier `controllers/` n'apparaît qu'à partir de deux.
- ✅ Validation des inputs HTTP via un **pipe de validation Zod** appliqué aux schémas du package de contrats partagé — pas de DTO class-validator.
- ✅ Un `services/` de présentation compose plusieurs use-cases + effets (mail, notifications) que le controller/worker déclenche ; il ne contient pas de logique métier propre.
- ✅ Une feature est un regroupement de controllers, workers et queue-consumers qui partagent plusieurs domaines sous un nom qui les caractérise.
- ❌ Pas de requête DB ni de logique conditionnelle métier dans un controller.

## Contrats partagés — `packages/contracts`

- ✅ Tout schéma d'entrée/sortie partagé entre l'API et un front vit dans `packages/contracts` (`@app/contracts`), un dossier par domaine.
- ✅ Importer par sous-chemin : `@app/contracts/lost-items`, jamais un barrel racine `@app/contracts`.
- ❌ Ne pas dupliquer un schéma du contrat dans `domains/<domain-name>/validators/` — le contrat est la source de vérité.
- ❌ Ne pas garder un DTO `class-validator` en parallèle du schéma Zod pour le même endpoint.

## `shared/` — Code transversal

`helpers/` (fonctionnel générique), `types/` (globaux), `utils/` (technique : date, string, crypto).

- ✅ Un helper fait un traitement couplé l'application ou logique métier, il ne peut pas être réutilisé dans d'autres projets.
- ✅ Un utils fait un traitement technique, indépendant de l'application, il peut être réutilisé dans d'autres projets.
- ⚠️ Un helper **spécifique à un domaine** va dans `domains/helpers/`, pas dans `shared/`.

## Interdictions

❌ Interdit

- Logique métier dans un controller
- Instancier un `use-case` dans un autre `use-case`

## Où créer mes fichiers ?

| Situation                     | Chemin cible                                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nouveau cas d'usage           | `domains/<domain-name>/use-cases/create-[entity].use-case.ts`                                                                                          |
| Nouvel endpoint REST          | `presentations/<feature-name>/[entity].controller.ts` (ou `controllers/` si la feature en a plusieurs)                                                 |
| Nouveau schéma de validation  | package de contrats partagé — `[domaine]/*.schema.ts` (partagé front + back)                                                                            |
| Nouveau worker / cron         | `presentations/<feature-name>/[entity].worker.ts`                                                                                                      |
| Nouveau consommateur de queue | `presentations/<feature-name>/[entity].consumer.ts`                                                                                                    |
| Nouvelle API externe          | `infrastructures/<service-name>/[service].service.ts` + `infrastructures/<service-name>/[service].config.ts` (+ `packages/<service-name>/` si wrapper) |
| Nouvelle interface de repo    | `domains/<domain-name>/repository/[entity].repository.ts`                                                                                              |
| Nouveau mapper                | `domains/<domain-name>/mappers/[entity].mapper.ts`                                                                                                     |
| Nouvelle erreur métier        | `domains/<domain-name>/errors/[entity].errors.ts`                                                                                                      |
| Nouveau type métier           | `domains/<domain-name>/types/[entity].types.ts`                                                                                                        |
| Nouveau helper métier         | `domains/<domain-name>/helpers/[entity].helper.ts`                                                                                                     |

## Nommage

`[entity].repository.ts`, `[entity].mapper.ts`, `create-[entity].use-case.ts`, `[entity].errors.ts`, `[entity].const.ts` — et `[entity].schema.ts` dans le package de contrats.

## Erreurs fréquentes à éviter

- ❌ Déclarer les controllers dans le module de domaine au lieu d'un module de présentation.
- ❌ Créer `presentations/http/...` au lieu d'une feature `presentations/<feature>/`.
- ❌ Ajouter un dossier `validators/` local qui recopie ou réexporte un contrat partagé.
- ❌ Regrouper tous les cas d'usage d'un domaine dans un seul fichier `*.use-cases.ts` — un fichier par use-case.
- ❌ Nommer les dossiers au singulier (`infrastructure/`, `presentation/`) — la convention est `infrastructures/` et `presentations/`.
- ❌ Introduire une surcouche `infrastructures/<feature>` alors qu'un repository Prisma direct suffit.

## Flux de dépendances (règle absolue)

```
presentations/ → domains/use-cases → domains/repository
                                            ↕
                                  infrastructures
```

Les flèches vont **toujours vers `domains/`**, jamais l'inverse.

- `presentation/` connaît `domains/`, mais `domains/` ne connaît pas `presentation/`.
- `infra/` implémente des interfaces de `domains/`, mais `domains/` ne connaît pas `infra/`.
- `shared/` ne dépend d'aucune autre couche.
