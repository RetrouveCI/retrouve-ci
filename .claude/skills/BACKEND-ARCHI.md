# Backend RetrouveCI — NestJS / DDD / Clean Architecture

## Vue d'ensemble

```
src/
├── domains/        # ❤️ Logique métier pure — cœur de l'app
├── infra/          # 🔌 Implémentations concrètes (DB, APIs externes...)
├── presentation/   # 🚪 Points d'entrée (HTTP, queues, workers)
├── libs/           # 📦 Wrappers de librairies externes
└── shared/         # 🔧 Utilitaires et types transversaux
```

> Note RetrouveCI : si le projet est organisé en modules NestJS (`lost-items/`,
> `qr-codes/`, `users/`, `matching/`, `notifications/`...), cette structure
> 5-zones s'applique **à l'intérieur de chaque module**, ou en transversal si tu
> préfères une approche "couches globales". À clarifier avec le Squad Lead si le
> repo n'a pas encore tranché — voir règle de fin de fichier.

---

## `domains/` — Logique métier

> Cœur de l'application. **Ne dépend d'aucune librairie externe** (pas d'import
> Prisma/TypeORM, pas d'import NestJS sauf décorateurs purement structurels si
> nécessaire).

```
domains/
├── repository/         # Interfaces d'accès aux données
├── mappers/            # Transformation entité ↔ DTO
├── use-cases/          # Cas d'usage métier (commandes / queries)
├── validators/         # Règles de validation métier
├── helpers/            # Fonctions utilitaires fonctionnelles (pures)
├── types/              # Types partagés au sein du domaine
├── errors/             # Classes d'erreurs métier
└── *.const.ts          # Constantes métier
```

### Règles

- ❌ Aucune dépendance vers `infra/` ou `presentation/`
- ✅ Les `use-cases` orchestrent : `repository` (interface) + `validators` +
  `mappers`
- ✅ Les `errors/` étendent une classe de base commune (ex: `DomainError`)
- ✅ Les `repository/` ne sont que des **interfaces** — l'implémentation est
  dans `infra/`

### Exemples RetrouveCI

| Fichier                                   | Rôle                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------- |
| `lost-item.repository.ts`                 | Interface du repo LostItem                                           |
| `lost-item.mapper.ts`                     | Entité ↔ DTO                                                        |
| `create-lost-item.use-case.ts`            | Déclaration d'un objet perdu                                         |
| `report-found-item.use-case.ts`           | Signalement d'un objet retrouvé                                      |
| `match-items.use-case.ts`                 | Cas d'usage de matching perdu/retrouvé                               |
| `qr-code.validator.ts`                    | Validation du format de référence QR                                 |
| `lost-item.errors.ts`                     | `LostItemNotFoundError`, `AlreadyClaimedError`                       |
| `lost-item.const.ts`                      | `ITEM_STATUSES`, `MAX_PHOTOS`                                        |
| `matching/helpers/compute-match-score.ts` | Helper métier de scoring — reste dans `domains/`, pas dans `shared/` |

---

## `infra/` — Services externes

> Implémentation concrète des interfaces définies dans `domains/`.

```
infra/
├── *.config.ts         # Configuration des services
└── *.service.ts         # Implémentation des repositories et services
```

### Règles

- ✅ Toujours implémenter une interface déclarée dans `domains/`
- ✅ Un fichier `.config.ts` par service externe
- ❌ Jamais de logique métier ici

### Exemples RetrouveCI

| Fichier                           | Rôle                                                     |
| --------------------------------- | -------------------------------------------------------- |
| `database.config.ts`              | Config Prisma/TypeORM                                    |
| `lost-item.repository.service.ts` | Implémentation du repo LostItem (Postgres)               |
| `qr-code-generator.config.ts`     | Config du générateur de QR codes                         |
| `qr-code-generator.service.ts`    | Implémentation via la lib QR (wrappée dans `libs/`)      |
| `push-notification.service.ts`    | Implémentation notifications (via `libs/notifications/`) |
| `storage.service.ts`              | Upload photos d'objets (S3/MinIO)                        |

---

## `presentation/` — Points d'entrée

> Expose l'application au monde extérieur. Ne contient **aucune logique
> métier**.

```
presentation/
├── controllers/        # Endpoints HTTP (REST)
├── workers/            # Traitements de fond (crons, matching périodique)
└── queue-consumers/     # Consommateurs de messages (notifications, matching async)
```

### Règles

- ✅ Les controllers **délèguent** aux `use-cases` — rien de plus
- ✅ La validation des inputs HTTP se fait via les `validators` du domaine (DTO
  NestJS + validators domaine pour les règles métier)
- ❌ Pas de requêtes DB directes dans un controller
- ❌ Pas de logique conditionnelle métier dans un controller

### Exemples RetrouveCI

| Fichier                     | Rôle                                       |
| --------------------------- | ------------------------------------------ |
| `lost-items.controller.ts`  | Endpoints CRUD objets perdus               |
| `qr-codes.controller.ts`    | Génération/scan de QR codes                |
| `matching.worker.ts`        | Cron de matching périodique perdu/retrouvé |
| `notifications.consumer.ts` | Consumer queue pour envoi de notifications |

---

## `libs/` — Abstractions de librairies externes

> Wrappers internes qui isolent les dépendances tierces. Si une lib change, on
> ne modifie qu'ici.

```
libs/
├── qr-generator/        # Wrapper autour de la lib de génération QR
├── notifications/        # Wrapper notifications push (Firebase, OneSignal...)
├── mailer/
└── storage/
```

### Règle

- ✅ Toute librairie externe critique doit être wrappée ici avant utilisation
  dans `infra/`

---

## `shared/` — Code transversal

> Utilitaires et types partagés entre plusieurs modules/domaines.

```
shared/
├── helpers/            # Fonctions utilitaires génériques (non-métier)
├── types/              # Types globaux réutilisables
└── utils/              # Utilitaires techniques (date, string, crypto...)
```

### Règle d'or

> ⚠️ Si un helper est **spécifique à un domaine** (ex: scoring de matching,
> génération de référence QR), il va dans `domains/[module]/helpers/` — pas dans
> `shared/`.

|                                      | `shared/helpers/` | `domains/[module]/helpers/` |
| ------------------------------------ | ----------------- | --------------------------- |
| Formater une date                    | ✅                | ❌                          |
| Calculer un score de matching        | ❌                | ✅                          |
| Générer un UUID                      | ✅                | ❌                          |
| Valider le format d'une référence QR | ❌                | ✅                          |

---

## Question ouverte — organisation modulaire

RetrouveCI étant en migration, deux options sont possibles pour la cohabitation
NestJS-modules + DDD :

1. **Couches globales** : `src/domains/`, `src/infra/`, etc. en transversal,
   avec sous-dossiers par module métier à l'intérieur (ex:
   `domains/lost-items/`, `domains/qr-codes/`)
2. **Module-first** : chaque module NestJS (`lost-items/`, `qr-codes/`...)
   contient sa propre arborescence `domains/infra/presentation/` complète

Si ce choix n'a pas encore été tranché pour le repo, propose l'option 1 (plus
proche de la convention Arolitec) mais demande confirmation avant de structurer
un nouveau module.
