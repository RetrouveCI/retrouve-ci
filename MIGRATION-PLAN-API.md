# Plan de migration — `apps/api` (`@app/api`)

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre les étapes **E6**,
> **E8**, **E9**. Convention cible : skill `backend-conventions` (NestJS · DDD +
> Clean Architecture).
>
> Rappel méthode : une étape = une branche = une PR `gh` = une session, et **on
> demande la permission avant tout commit** (signatures GPG).

---

## 1. Inventaire

**8 domaines · 41 use-cases · 84 fichiers TS · 30 fichiers de test (188
tests).**

| Domaine            | Fichiers | Use-cases (méthodes actuelles)                                                                               | Sous-dossiers présents                                                  |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `contact-messages` | 10       | `create`, `getById`, `list`, `getOne`, `updateStatus` (5)                                                    | errors, mappers, **models**, repository, types                          |
| `events`           | 12       | `create`, `getById`, `list`, `update`, `delete` (5)                                                          | errors, mappers, **models**, repository, types, **validators**          |
| `lost-items`       | 12       | `create`, `getById`, `view`, `recordContact`, `list`, `listMine`, `update`, `moderate`, `delete` (9)         | errors, mappers, **models**, repository, types                          |
| `matching`         | 6        | `findMatches`, `notifyMatches` (2)                                                                           | helpers, **models**                                                     |
| `notifications`    | 10       | `create`, `listMine`, `markAsRead`, `markAllAsRead`, `getUnreadCount` (5)                                    | errors, mappers, **models**, repository, types                          |
| `qr-codes`         | 13       | `generateBatch`, `getByCode`, `activate`, `revoke`, `updateDetails`, `list`, `listMine`, `getPublicView` (8) | errors, helpers, mappers, **models**, repository, types, **validators** |
| `reporting`        | 5        | `getDashboardStats` (1)                                                                                      | **models**, repository                                                  |
| `sticker-orders`   | 16       | `create`, `getById`, `getOne`, `list`, `listMine`, `updateStatus` (6)                                        | errors, helpers, mappers, **models**, repository, types, **validators** |

Features de présentation (11) : `auth`(account), `contact-messages`, `events`,
`health`, `lost-items`, `matching`, `notifications`, `qr-codes`, `stats`,
`sticker-orders`, `uploads`.

---

## 2. Les 10 écarts à corriger

| #   | Écart                                                                                         | Étape        |
| --- | --------------------------------------------------------------------------------------------- | ------------ |
| 1   | `use-cases/<domaine>.use-cases.ts` : une classe fourre-tout au lieu d'un fichier par use-case | E8           |
| 2   | Aucun `<domaine>-domain.module.ts` — les providers sont dans le module de présentation        | E8           |
| 3   | `domains/*/models/` : couche en trop (fusionner dans `types/`)                                | E8           |
| 4   | ~~`domains/*/validators/` : couche en trop (remplacée par les contrats Zod)~~ ✅              | E6 ✅        |
| 5   | ~~DTO `class-validator` dans `presentation/*/dto/` → schémas Zod + pipe~~ ✅                  | E6 ✅        |
| 6   | ~~`infrastructure/` → `infrastructures/`, `presentation/` → `presentations/`~~ ✅             | E8.1 ✅      |
| 7   | ~~`libs/storage/cloudinary.ts` hors norme → `infrastructures/storage/`~~ ✅                   | E8.1 ✅      |
| 8   | Tests `*.spec.ts` colocalisés → `__tests__/<name>.test.ts`                                    | E9           |
| 9   | Aucune couche `shared/auth/{guards,decorators}` — contrôles de rôle dispersés                 | E8 (partiel) |
| 10  | `shared/` quasi vide : manquent pipe Zod, `IDomainUseCase`, pagination, env                   | E8           |

---

## 3. E6 — Contrats Zod par domaine — ✅ fait

**Branches** `migration-e6-contracts-<domaine>` · **scope** `api/<domaine>` ·
**2 j au total** · dépend de E5.

### 3.1 Recette, à répéter par domaine

1. **Extraire** les règles des DTO `class-validator` de
   `presentation/<f>/dto/*.dto.ts` vers
   `packages/contracts/src/<domaine>/<action>.schema.ts`. Exemple sur `events` :

   ```ts
   // packages/contracts/src/events/create.schema.ts — tel que livré en E6.2
   import { z } from 'zod'

   export const createEventSchema = z.object({
   	title: z
   		.string()
   		.trim()
   		.min(3, 'Le titre doit contenir au moins 3 caractères')
   		.max(120, 'Maximum 120 caractères'),
   	// …
   	eventDate: eventDateSchema,
   })

   export type CreateEventInput = z.input<typeof createEventSchema>
   export type CreateEventData = z.output<typeof createEventSchema>
   ```

   Deux règles que E6.2 a payées : **chaque message est en français**, y compris
   les plafonds, puisque c'est le contrat qui alimente les champs du formulaire
   ; et **`z.iso.datetime()` est un piège** pour un champ de date — il exige les
   secondes et le fuseau, que `<input type="datetime-local">` ne poste pas.
   `events` valide la forme ISO à la main (voir `create.schema.ts`).

2. **Absorber le `validators/`** : les règles qui y vivaient (ex.
   `validateCreateEvent` qui contrôle `description.trim().length`) deviennent
   des raffinements Zod (`.trim()`, `.refine()`). Ce qui n'est **pas**
   exprimable en Zod (invariants inter-agrégats, unicité en base) **reste dans
   le use-case**, pas dans un `validators/`.
3. **Controller** : remplacer le DTO par le pipe.

   ```ts
   @Post()
   create(@Body(new ZodValidationPipe(createEventSchema)) data: CreateEventData) {
     return this.createEvent.execute(data)
   }
   ```

   Un champ inconnu du schéma est désormais **retiré** au lieu de valoir un 400
   : le pipe Zod n'est pas `forbidNonWhitelisted`. Vérifié sur `events`.

4. **`domains/<d>/types/`** dérive du contrat :
   `export type CreateEventData = z.output<typeof createEventSchema>`.
5. **Supprimer** `presentation/<f>/dto/` et `domains/<d>/validators/` du domaine
   traité.
6. **Front** : la ou les features correspondantes importent désormais
   `@app/contracts/<domaine>` (voir plans client / admin).

### 3.2 Prérequis livré dans la première PR d'E6

- `src/shared/pipes/zod-validation.pipe.ts` (repris de la référence).
- ~~Conserver `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted`)
  tant que des DTO subsistent ; ne le retirer qu'à la dernière PR d'E6.~~ ✅
  Retiré en E6.7 avec le dernier DTO, en même temps que `class-validator` et
  `class-transformer`. Chaque `@Body`/`@Query` de `presentation/` porte
  désormais son propre `ZodValidationPipe` ; un `@Param` n'en a pas besoin.
- `src/shared/swagger/api-zod.decorator.ts` (E6.7) : `@ApiZodBody` et
  `@ApiZodQuery` dérivent le schéma OpenAPI du contrat par `z.toJSONSchema`,
  puisque les `@ApiProperty` sont partis avec les DTO. Aucune dépendance
  nouvelle — Zod 4 l'embarque.

### 3.3 Ordre (du moins couplé au plus couplé)

```
contact-messages ✅ → events ✅ → notifications ✅ → sticker-orders ✅ → qr-codes ✅ → lost-items ✅ → auth ✅
```

`matching` et `reporting` n'ont pas d'entrée HTTP utilisateur : rien à
contractualiser.

`lost-items` a fermé le dernier `domains/*/validators/` du dépôt : plus aucun
domaine n'en porte. `auth` a fermé E6 : plus aucun `*.dto.ts`, plus aucun
importateur de `class-validator`, et le `ValidationPipe` global est parti avec.

**Ce qu'`auth` a exposé** — une même colonne `user.password` était gouvernée par
**cinq** règles différentes (api `min 6`, deux fronts `min 6` avec et sans
plafond, admin `min 8` + complexité, et la création d'administrateur `min 6`
sans complexité). `shared/password.ts` en fait une : `8..128` plus une
majuscule, une minuscule et un chiffre. `packages/auth` pose la longueur côté
serveur — better-auth la vérifiait déjà par défaut à 8, c'est le dépôt qui
l'abaissait à 6 — et un hook `before` sur `/admin/create-user` couvre le seul
chemin d'écriture que better-auth ne borne pas lui-même. Les deux longueurs
d'OTP concurrentes (`length(6)` et `/^\d{4,8}$/`) deviennent `OTP_LENGTH`, la
seule que le plugin `phoneNumber()` émette. `phoneNumberValidator` est enfin
fourni au plugin : un mauvais numéro échoue immédiatement au lieu de brûler les
trois tentatives BullMQ d'`OtpConsumer`.

**Dette ouverte, non introduite par E6.7** : un champ **absent** est refusé en
anglais (`Invalid input: expected string, received undefined`) sur les six
domaines déjà mergés, alors que CLAUDE.md exige le français. `auth` nomme ses
propres messages et n'est pas concerné. `z.config(z.locales.fr())` corrigerait
tout en une ligne, mais l'instance zod est partagée avec better-auth, dont les
messages basculeraient aussi : décision à prendre séparément.

---

## 4. E8 — Refonte structurelle

**Branches** `migration-e8-*` · **scope** `api/<domaine>` ou `api/core` · **3
j** · dépend de E6.

### 4.1 PR 1 — Renommages mécaniques (`api/core`) — ✅ fait (E8.1)

Un commit par renommage, `typecheck` entre chaque :

1. ✅ `src/infrastructure/` → `src/infrastructures/`
2. ✅ `src/presentation/` → `src/presentations/`
3. ✅ `src/libs/storage/cloudinary.ts` →
   `src/infrastructures/storage/cloudinary.client.ts`, suppression de
   `src/libs/`

Les imports sont en `@/…` : un `sed` sur `@/infrastructure/` →
`@/infrastructures/` a suffi, le `typecheck` arbitrant entre chaque commit. Les
41 imports relatifs internes aux deux dossiers se déplacent avec eux et n'ont
pas bougé. Rien hors de `src/` ne nommait ces chemins — ni `nest-cli.json`, ni
les tsconfig, ni le `Dockerfile` — donc le renommage s'arrête à `src/` et aux
documents.

`src/` ne porte plus que les quatre couches de la cible : `domains/`,
`infrastructures/`, `presentations/` et `shared/`.

### 4.2 PR 2 — Socle `shared/` (`api/core`)

Créer, sur le modèle de la référence :

```
src/shared/
├── types/domain-use-case.type.ts     # export interface IDomainUseCase<In, Out> { execute(input: In): Promise<Out> }
├── utils/pagination.util.ts
├── config/env.validation.ts          # remplace la lecture ad hoc de process.env
└── constants/queue.constants.ts
```

`shared/errors/domain.error.ts` et `shared/filters/domain-exception.filter.ts`
existent déjà — les déplacer vers `shared/errors/` pour coller à la référence
(`domain-error.ts` + `domain-exception.filter.ts` dans le même dossier).

### 4.3 PR 3..10 — Un domaine par PR

Pour chaque domaine, dans l'ordre `contact-messages` (pilote) → `events` →
`notifications` → `reporting` → `matching` → `sticker-orders` → `qr-codes` →
`lost-items` :

1. **Éclater** `<domaine>.use-cases.ts`. Une méthode → un fichier → une classe :

   | Méthode actuelle     | Fichier cible                                    |
   | -------------------- | ------------------------------------------------ |
   | `create`             | `use-cases/create-<entity>.use-case.ts`          |
   | `getById` / `getOne` | `use-cases/get-<entity>-by-id.use-case.ts`       |
   | `list`               | `use-cases/get-paginated-<entities>.use-case.ts` |
   | `listMine`           | `use-cases/get-my-<entities>.use-case.ts`        |
   | `update`             | `use-cases/update-<entity>.use-case.ts`          |
   | `updateStatus`       | `use-cases/update-<entity>-status.use-case.ts`   |
   | `delete`             | `use-cases/delete-<entity>.use-case.ts`          |
   | `moderate`           | `use-cases/moderate-<entity>.use-case.ts`        |

   Chaque classe : `@Injectable()`, `implements IDomainUseCase<In, Out>`, un
   `Logger` nommé, et **une seule** méthode publique `execute`.

   ⚠️ **Interdit** : un use-case qui en instancie ou en appelle un autre.
   Aujourd'hui `update` appelle `this.getById(id)` — extraire la vérification
   d'existence dans le **repository** ou la dupliquer, mais pas d'appel
   inter-use-cases.

2. **Fusionner** `models/<entity>.model.ts` dans `types/<entity>.types.ts`,
   supprimer `models/`.
3. **Créer** `<domaine>-domain.module.ts` :
   ```ts
   @Module({
   	providers: [EventRepositoryProvider, CreateEventUseCase /* … */],
   	exports: [EventRepositoryProvider, CreateEventUseCase /* … */],
   })
   export class EventsDomainModule {}
   ```
4. **Alléger** `presentations/<f>/<f>.module.ts` :
   ```ts
   @Module({ controllers: [EventsController], imports: [EventsDomainModule] })
   export class EventsModule {}
   ```
5. **Aplatir** le controller : `presentations/<f>/<f>.controller.ts` à la racine
   de la feature quand il n'y en a qu'un (cas de 10 features sur 11). Le
   sous-dossier `controllers/` ne survit qu'à partir de deux controllers.
6. Le controller injecte les use-cases **un par un** (la référence met un
   `// eslint-disable-next-line max-params` sur les constructeurs à 5+
   paramètres).

### 4.4 Cas particuliers

- **`matching`** : pas de `repository/`, il consomme ceux de `lost-items` et
  `notifications`. Son `queue-consumers/matching.consumer.ts` est déjà au bon
  endroit. Le domaine importe les domain modules des deux autres.
- **`reporting`** : un seul use-case, pas d'`errors/` ni de `mappers/`. Créer
  quand même le domain module — la règle « chaque domaine est un module NestJS
  indépendant » ne souffre pas d'exception.
- **`uploads`** et **`stats`** : features de présentation sans domaine propre.
  `uploads` délègue à `infrastructures/storage`, `stats` au domaine `reporting`.
  Rien à éclater.
- **`auth`/`account`** : la feature de présentation reste ; l'infrastructure
  better-auth reste dans `infrastructures/auth/`.

### 4.5 Autorisation (écart n°9, traitement partiel)

Créer `shared/auth/guards/` + `shared/auth/decorators/` **sans** introduire
encore `@app/permissions` : un `AdminGuard` et un décorateur `@RequireAdmin()`
suffisent au modèle de rôles actuel (`admin` / non-admin). Le passage à
`RequireRights(['posts:moderate'])` viendra avec `@app/permissions`, hors
périmètre de cette migration.

**Règle à faire respecter dès maintenant** : l'autorisation vit dans
`presentations/`, jamais dans un use-case ni un repository.

---

## 5. E9 — Tests

**Branche** `migration-e9-tests-api` · **scope** `api/tests` · **1 j** · dépend
de E4 et E8.

1. Déplacer les **30** `*.spec.ts` vers `__tests__/<name>.test.ts`, en miroir
   exact du code :
   ```
   domains/events/use-cases/
   ├── create-event.use-case.ts
   └── __tests__/
       └── create-event.use-case.test.ts
   ```
2. `vitest.config.mts` : `include: ['src/**/__tests__/*.test.ts']`.
3. **Éclater les tests avec les use-cases** : chaque `describe('create')` de
   `event.use-cases.spec.ts` devient `__tests__/create-event.use-case.test.ts`.
   → À faire **pendant** E8, pas après : les tests existants sont le filet de
   sécurité de l'éclatement. E9 ne fait alors que ranger et compléter.
4. Combler les trous : chaque branche, chaque chemin d'erreur, chaque edge case
   d'entrée (vide, `null`, bornes, collections à 0 et 1 élément) — cf. skill
   `unit-tests`.
5. Cibles sans test aujourd'hui : `infrastructures/auth`,
   `infrastructures/queue`, `infrastructures/seeder`, les mappers de
   `reporting`.

---

## 6. Ordre d'exécution recommandé

```
E6.1 contact-messages ✅ ─┐
E6.2 events ✅           │  (contrats, 1 PR / domaine)
E6.3 notifications ✅    │
E6.4 sticker-orders ✅   │
E6.5 qr-codes ✅         │
E6.6 lost-items ✅       │
E6.7 auth ✅             ─┘
        ↓
E8.1 renommages (api/core)
E8.2 socle shared/ (api/core)
E8.3 contact-messages   ← PILOTE : valider le gabarit avant de continuer
E8.4..E8.10 les 7 autres domaines
        ↓
E9 tests
```

**Pilote** : `contact-messages` de bout en bout (E6.1 puis E8.3) avant tout le
reste. 10 fichiers, CRUD pur, ni queue ni upload — le gabarit se relit en une
PR.

---

## 7. Vérification par PR

```bash
pnpm --filter @app/api run typecheck
pnpm --filter @app/api run lint
pnpm --filter @app/api run test
pnpm run format:check
```

Puis, sur le domaine touché :

- [ ] un fichier = un use-case, une seule méthode publique `execute`
- [ ] aucun use-case n'en appelle un autre
- [ ] `<domaine>-domain.module.ts` existe et exporte tout ce que la présentation
      consomme
- [ ] plus de `models/`, plus de `validators/`, plus de `dto/` sur ce domaine
- [ ] le controller ne fait que déléguer — aucune requête DB, aucune condition
      métier
- [ ] l'autorisation est sur le controller
- [ ] tests dans `__tests__/`, nommés `<name>.test.ts`
