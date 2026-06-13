# Backend RetrouveCI — NestJS v11 / DDD / Clean Architecture

## Vue d'ensemble

Organisation **par couche au niveau racine** (`apps/api/src`), avec un
sous-dossier par feature dans chaque couche : `domains/[feature]/`,
`infrastructure/[feature]/`, `presentation/[feature]/`. Les wrappers de libs
externes et le code transversal non-métier vivent dans `libs/` et `shared/`.

### Imports

Un alias TypeScript `@/*` pointe vers `apps/api/src/*` (configuré dans
`tsconfig.json` via `baseUrl`/`paths`). Toute importation qui traverse un
dossier racine (`domains/`, `infrastructure/`, `presentation/`, `libs/`,
`shared/`) doit utiliser cet alias, ex. `@/domains/lost-items/constants`,
`@/shared/errors/domain.error`. Les imports relatifs (`./`, `../`) restent
réservés aux fichiers d'un même module/feature (ex: entre `mappers/` et
`models/` d'un même domaine). Le build (`pnpm --filter api build`) exécute
`tsc-alias` après `nest build` pour réécrire ces alias en chemins relatifs dans
`dist/`.

```
apps/api/src/
├── domains/                 # ❤️ Logique métier, un sous-dossier par feature
│   └── [feature]/           # ex: lost-items/, qr-codes/, users/, matching/
│       ├── repository/      # Interface d'accès aux données + implémentation Prisma
│       ├── mappers/         # Prisma ↔ modèle de sortie (models/)
│       ├── models/          # Types de données sortantes du domaine (ex: LostItem)
│       ├── use-cases/       # Cas d'usage métier (commandes / queries)
│       ├── validators/      # Règles de validation métier
│       ├── helpers/         # Fonctions utilitaires fonctionnelles (pures)
│       ├── types/           # Types partagés au sein du domaine (inputs, filtres...)
│       ├── errors/          # Classes d'erreurs métier
│       └── constants.ts     # Constantes métier
├── infrastructure/          # 🔌 Services d'infrastructure globaux + externes
│   ├── database/             # Services globaux (PrismaService...)
│   ├── queue/                 # Services globaux (BullModule/Redis...)
│   ├── auth/                  # Services globaux (Better Auth...)
│   └── [feature]/             # Services externes spécifiques à une feature (hors repository)
│       ├── *.config.ts        # Configuration des services
│       └── *.service.ts        # ex: qr-code-generator.service.ts, storage.service.ts
├── presentation/            # 🚪 Points d'entrée, un sous-dossier par feature
│   └── [feature]/
│       ├── controllers/      # Endpoints HTTP (REST)
│       ├── dto/              # DTOs de validation des inputs HTTP
│       ├── workers/          # Traitements de fond (crons, matching périodique)
│       ├── queue-consumers/  # Consommateurs de messages
│       └── [feature].module.ts  # Module NestJS : wiring use-cases + repository + controllers
├── libs/                    # 📦 Wrappers de librairies externes (transversal)
└── shared/                  # 🔧 Utilitaires et types transversaux non-métier
    └── errors/
        └── domain.error.ts # Classe de base DomainError (transversale)
```

> `domains/`, `infrastructure/`, `presentation/`, `libs/` et `shared/` sont les
> **cinq dossiers racine**. Chaque feature (`lost-items`, `qr-codes`,
> `matching`...) a son sous-dossier dans `domains/`, `infrastructure/` (si
> besoin d'implémentations spécifiques) et `presentation/`.

---

## `domains/[feature]/` — Logique métier

> Cœur de l'application. Les `use-cases`, `validators`, `types`, `models`,
> `errors` et `constants.ts` **ne dépendent d'aucune librairie externe** (pas
> d'import Prisma/TypeORM, pas d'import NestJS sauf décorateurs purement
> structurels si nécessaire). `repository/` et `mappers/` font exception : ils
> contiennent aussi l'implémentation Prisma et les conversions Prisma ↔ modèle.

```
domains/[feature]/
├── repository/
│   ├── lost-item.repository.ts          # Interface d'accès aux données
│   └── lost-item.repository.service.ts  # Implémentation Prisma de l'interface
├── mappers/
│   └── lost-item.mapper.ts              # Conversions Prisma ↔ models/ (entité + enums)
├── models/
│   └── lost-item.model.ts               # Types de données sortantes du domaine (LostItem, LostItemListResponse)
├── use-cases/
│   └── lost-item.use-cases.ts           # Une seule classe regroupant tous les cas d'usage de la feature
├── validators/         # Règles de validation métier
├── helpers/            # Fonctions utilitaires fonctionnelles (pures)
├── types/              # Types partagés au sein du domaine (inputs, filtres...)
├── errors/             # Classes d'erreurs métier
└── constants.ts        # Constantes métier
```

### Règles

- ❌ Aucune dépendance vers `presentation/`
- ✅ Les `use-cases` orchestrent : `repository` (interface) + `validators`
- ✅ Les `errors/` étendent une classe de base commune (`DomainError`,
  `NotFoundError` ou `ValidationError`, définies dans
  `shared/errors/domain.error.ts`)
- ✅ `repository/` contient l'interface **et** son implémentation Prisma
  (`*.repository.service.ts`) ; `mappers/` contient les conversions
  Prisma ↔ `models/` (entité + enums) utilisées par cette implémentation
- ✅ `models/` centralise les **données sortantes du domaine** (ex: `LostItem`,
  `LostItemListResponse`). Un seul type est utilisé tout au long du flow —
  `repository`, `use-cases` et `presentation` (controllers) retournent et
  consomment directement ces types, sans DTO de présentation ni mapper
  supplémentaire
- ✅ Les `use-cases` ne dépendent que de l'**interface** du repository (via le
  token d'injection), jamais directement de l'implémentation Prisma
- ✅ `use-cases/` contient **un seul fichier par domaine**
  (`[feature].use-cases.ts`) exportant **une seule classe** `[Feature]UseCases`
  dont chaque méthode (`create`, `getById`, `list`...) est un cas d'usage —
  pas une classe par use-case

### Exemples RetrouveCI

| Fichier                                                       | Rôle                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| `shared/errors/domain.error.ts`                               | Classes de base `DomainError`, `NotFoundError`, `ValidationError`   |
| `domains/lost-items/repository/lost-item.repository.ts`       | Interface du repo LostItem                                          |
| `domains/lost-items/repository/lost-item.repository.service.ts` | Implémentation Prisma du repo LostItem                            |
| `domains/lost-items/mappers/lost-item.mapper.ts`              | Conversions Prisma ↔ `models/` (enums, entité `LostItem`)           |
| `domains/lost-items/models/lost-item.model.ts`                | Types de sortie du domaine : `LostItem`, `LostItemListResponse`     |
| `domains/lost-items/use-cases/lost-item.use-cases.ts`          | Classe `LostItemUseCases` (create, getById, list...)                |
| `domains/matching/use-cases/matching.use-cases.ts`             | Classe `MatchingUseCases` (cas d'usage de matching perdu/retrouvé)  |
| `domains/lost-items/errors/lost-item.errors.ts`                | `LostItemNotFoundError`, `InvalidLostItemError`                     |
| `domains/lost-items/constants.ts`                              | `LOST_ITEM_CATEGORIES`, `MAX_PHOTOS`                                |
| `domains/matching/helpers/compute-match-score.ts`              | Helper métier de scoring — reste dans `domains/`, pas dans `shared/` |

---

## `infrastructure/` — Services d'infrastructure et externes

> Services globaux transversaux (`database/`, `queue/`, `auth/`) injectés dans
> plusieurs feature modules, et services externes spécifiques à une feature
> qui ne sont **pas** des repositories (génération QR, notifications,
> stockage...). Les implémentations de `repository/` vivent dans
> `domains/[feature]/repository/`, pas ici.

```
infrastructure/
├── database/
│   ├── prisma.module.ts     # Module global exposant PrismaService
│   └── prisma.service.ts    # Client Prisma (connexion/déconnexion)
├── queue/
│   └── queue.module.ts      # Module global exposant BullModule (Redis)
├── auth/
│   ├── auth.config.ts       # Instance Better Auth (adapter Prisma, plugins)
│   └── auth.module.ts        # Module global exposant l'AuthModule Better Auth
└── [feature]/
    ├── *.config.ts           # Configuration des services spécifiques à la feature
    └── *.service.ts            # Implémentation de services externes (hors repository)
```

### Règles

- ✅ Un fichier `.config.ts` par service externe
- ✅ `database/`, `queue/`, `auth/` sont réservés aux services **globaux**
  injectés dans plusieurs feature modules
- ❌ Jamais de logique métier ici
- ❌ Pas d'implémentation de `repository/` ici — elle va dans
  `domains/[feature]/repository/`

### Exemples RetrouveCI

| Fichier                                                     | Rôle                                                     |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `infrastructure/database/prisma.service.ts`                | Config Prisma globale                                    |
| `infrastructure/qr-codes/qr-code-generator.config.ts`       | Config du générateur de QR codes                         |
| `infrastructure/qr-codes/qr-code-generator.service.ts`      | Implémentation via la lib QR (wrappée dans `libs/`)      |
| `infrastructure/notifications/push-notification.service.ts` | Implémentation notifications (via `libs/notifications/`) |
| `infrastructure/storage/storage.service.ts`                 | Upload photos d'objets (S3/MinIO)                        |

---

## `presentation/[feature]/` — Points d'entrée

> Expose l'application au monde extérieur. Ne contient **aucune logique
> métier**. Dépend des `use-cases` exposés par `domains/[feature]/`.

```
presentation/[feature]/
├── controllers/        # Endpoints HTTP (REST)
├── dto/                 # DTOs de validation des inputs HTTP (class-validator)
├── workers/            # Traitements de fond (crons, matching périodique)
├── queue-consumers/     # Consommateurs de messages (notifications, matching async)
└── [feature].module.ts  # Module NestJS : wiring use-cases + repository + controllers
```

### Règles

- ✅ Les controllers **délèguent** aux `use-cases` — rien de plus
- ✅ La validation des inputs HTTP se fait via les `dto/` (class-validator +
  `ValidationPipe`) et les `validators/` du domaine pour les règles métier
- ✅ Le `[feature].module.ts` lie l'interface `repository/` du domaine à son
  implémentation `*.repository.service.ts` (via token d'injection)
- ❌ Pas de requêtes DB directes dans un controller
- ❌ Pas de logique conditionnelle métier dans un controller

### Exemples RetrouveCI

| Fichier                                                       | Rôle                                       |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `presentation/lost-items/controllers/lost-items.controller.ts` | Endpoints CRUD objets perdus               |
| `presentation/lost-items/lost-items.module.ts`                 | Module NestJS de la feature lost-items     |
| `presentation/qr-codes/controllers/qr-codes.controller.ts`     | Génération/scan de QR codes                |
| `presentation/matching/workers/matching.worker.ts`             | Cron de matching périodique perdu/retrouvé |
| `presentation/notifications/queue-consumers/notifications.consumer.ts` | Consumer queue pour envoi de notifications |

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
  dans `infrastructure/`

---

## `shared/` — Code transversal

> Utilitaires et types partagés entre plusieurs modules/domaines.

```
shared/
├── errors/
│   └── domain.error.ts # Classe de base DomainError, héritée par les erreurs métier des modules
├── helpers/            # Fonctions utilitaires génériques (non-métier)
├── types/              # Types globaux réutilisables
└── utils/              # Utilitaires techniques (date, string, crypto...)
```

### Règle d'or

> ⚠️ Si un helper est **spécifique à un domaine** (ex: scoring de matching,
> génération de référence QR), il va dans `domains/[feature]/helpers/` — pas
> dans `shared/`.

|                                      | `shared/helpers/` | `domains/[feature]/helpers/` |
| ------------------------------------ | ----------------- | ----------------------------- |
| Formater une date                    | ✅                | ❌                            |
| Calculer un score de matching        | ❌                | ✅                            |
| Générer un UUID                      | ✅                | ❌                            |
| Valider le format d'une référence QR | ❌                | ✅                            |
