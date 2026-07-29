---
name: backend-conventions
description: Structure et règles back-end NestJS (DDD + Clean Architecture). À utiliser pour créer ou modifier du code back-end — use-cases, controllers, repositories, services infra, mappers, errors — ou pour savoir dans quelle couche placer un fichier.
---

# Back-end — DDD + Clean Architecture

L'architecture back-end est organisée en 4 zones à responsabilités distinctes sous `src/`.

```
src/
├── domains/        # ❤️ Logique métier
├── infrastructures/ # 🔌 Implémentations concrètes et services tiers (DB, APIs externes, minio, stripe...)
├── presentations/   # 🚪 Points d'entrée (HTTP, queues, workers)
└── shared/         # 🔧 Utilitaires et types transversaux (non-métier)
```

## `domains/` — Logique métier

```
domains/
├── repository/    # Repositories du domaine
├── mappers/       # Transformation entité ↔ DTO
├── use-cases/     # Cas d'usage métier (commandes / queries)
├── helpers/       # Fonctions utilitaires fonctionnelles qui se limitent au domaine (pures)
├── types/         # Types partagés au sein du domaine
├── errors/        # Classes d'erreurs métier (étendent DomainError)
└── *.const.ts     # Constantes métier
    *.module.ts     # Module NestJS du domaine
```

- ❌ Aucune dépendance vers `presentations/`.

- ✅ Les `use-cases` orchestrent : `repository` + `mappers` + services techniques nécessaires.

- ✅ Les `errors/` étendent une classe de base commune (`DomainError`).

- ✅ Chaque domaine doit être un module NestJS indépendant

- ✅ Les types d'input/output métier d'un use-case vont dans `domains/<domain-name>/types/`.

- ✅ Les helpers spécifiques au domaine vont dans `domains/<domain-name>/helpers/`.

- ✅ Le module d'un domaine exporte ses use-cases/providers métier, mais ne déclare jamais de controller.

## `infrastructures/` — Services externes

```
infrastructures/
├── *.config.ts    # Configuration des services externes
└── *.service.ts   # Implémentation des repositories et services
```



- ✅ Utiliser `infrastructures/` uniquement quand il y a une vraie intégration technique à encapsuler.
- ✅ Un fichier `.config.ts` par service externe.
- ❌ Jamais de logique métier ici — uniquement de l'accès aux données.

- ⚠️ Ne pas créer un sous-dossier `infrastructures/<feature>` par réflexe si le code n'encapsule aucun service externe réel.



## Repositories et pragmatisme



- ✅ Dans ce codebase, un repository peut être une classe concrète dans `domains/<domain-name>/repository/` qui injecte directement `PrismaService`.

- ✅ Un use-case peut injecter directement un service technique existant (`MailService`, `ConfigService`, etc.) si cela simplifie le design.

- ❌ Ne pas ajouter d'interface, token DI, adapter ou module infra dédié sans besoin réel.

- ⚠️ L'inversion de dépendances est un outil, pas une obligation systématique.

## `presentations/` — Points d'entrée

```
presentations/
  <feature-name>/
    ├── controllers/      # Endpoints HTTP (REST)
    ├── workers/          # Traitements de fond (crons, schedulers)
    └── queue-consumers/  # Consommateurs de messages (BullMQ)
```

- ✅ Les controllers **délèguent** aux `use-cases` — rien de plus.
- ✅ Validation des inputs HTTP via le contrat partagé ou le schéma le plus proche de la source de vérité.
- ✅ Une feature est un regroupement de controllers, workers et queue-consumers qui partagent plusieurs domaines sous un nom qui les caractérise.
- ❌ Pas de requête DB ni de logique conditionnelle métier dans un controller.

- ✅ Préférer une structure feature-first, par exemple `presentations/user/controllers/user-invitations.controller.ts`.



## Contrats partagés



- ✅ Si un schéma d'entrée/sortie est partagé entre apps/packages, il doit vivre dans `packages/contracts`.

- ✅ Préférer des imports explicites par sous-chemin, par exemple `@app/contracts/user`.

- ❌ Ne pas créer de barrel root du style `@app/contracts` si l'intention est d'importer par domaine.

- ❌ Ne pas dupliquer un schéma du contrat dans `domains/<domain-name>/validators/` si le contrat est déjà la source de vérité.

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

| Nouvel endpoint REST          | `presentations/<feature-name>/controllers/[entity].controller.ts`                                                                                      |

| Nouveau worker / cron         | `presentations/<feature-name>/[entity].worker.ts`                                                                                                      |
| Nouveau consommateur de queue | `presentations/<feature-name>/[entity].consumer.ts`                                                                                                    |
| Nouvelle API externe          | `infrastructures/<service-name>/[service].service.ts` + `infrastructures/<service-name>/[service].config.ts` (+ `packages/<service-name>/` si wrapper) |

| Nouveau repository            | `domains/<domain-name>/repository/[entity].repository.ts`                                                                                              |

| Nouveau mapper                | `domains/<domain-name>/mappers/[entity].mapper.ts`                                                                                                     |

| Nouvelle erreur métier        | `domains/<domain-name>/errors/[entity].errors.ts`                                                                                                      |

| Nouveau type métier           | `domains/<domain-name>/types/[entity].types.ts`                                                                                                        |

| Nouveau helper métier         | `domains/<domain-name>/helpers/[entity].helper.ts`                                                                                                     |


## Nommage



`[entity].repository.ts`, `[entity].mapper.ts`, `create-[entity].use-case.ts`, `[entity].errors.ts`, `[entity].const.ts`.



## Erreurs fréquentes à éviter



- ❌ Mettre les controllers dans le module de domaine au lieu d'un module de présentation.

- ❌ Créer `presentations/http/...` au lieu d'une feature `presentations/<feature>/controllers/...`.

- ❌ Ajouter un dossier `validators/` local juste pour réexporter ou recopier un contrat partagé.

- ❌ Introduire une surcouche `infrastructure/<feature>` alors qu'un repository Prisma direct suffit.

- ❌ Importer un contrat via `@app/contracts` si la convention voulue est `@app/contracts/<domain>`.

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
