# Plan de migration — `apps/admin` (`@app/admin`)

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre la part admin des
> étapes **E6**, **E7**, **E10**, **E11**. Convention cible : skill
> `frontend-conventions` (React Router v7 · `app/routes/`).
>
> ⚠️ **Les sections d'inventaire et d'écarts ci-dessous décrivent la structure
> d'avant E13** (`app/features/<f>/`). Elles sont conservées telles quelles : ce
> sont les constats qui ont motivé les étapes, pas une description de l'état
> courant. Depuis #48 et #49, l'app est sur `app/routes/<zone>/<page>/` — voir
> §3.6 et §5/E13 du plan racine, et le skill `frontend-conventions`.
>
> Rappel méthode : une étape = une branche = une PR `gh` = une session, et **on
> demande la permission avant tout commit** (signatures GPG).

---

## 1. Inventaire

Back-office (port 3001), React Router v7 SSR, auth better-auth
**email/password + rôle admin**. Migré de Next.js App Router vers React Router
v7 — quelques reliquats subsistent.

| Feature            | Fichiers | Schémas Zod | Formulaires Conform | Données                |
| ------------------ | -------- | ----------- | ------------------- | ---------------------- |
| `qr`               | 18       | 1           | 1                   | API `qr-codes`         |
| `auth`             | 15       | 3           | 3                   | better-auth            |
| `users`            | 11       | —           | —                   | 🟡 **mock**            |
| `administrators`   | 8        | 1           | 2                   | 🟡 **mock**            |
| `posts`            | 8        | —           | —                   | API `lost-items`       |
| `events`           | 8        | 1           | 2                   | API `events`           |
| `profile`          | 8        | 1           | 1                   | better-auth            |
| `orders`           | 7        | —           | —                   | API `sticker-orders`   |
| `dashboard`        | 7        | —           | —                   | 🟡 **mock**            |
| `notifications`    | 6        | —           | —                   | API `notifications`    |
| `contact-messages` | 6        | —           | —                   | API `contact-messages` |

**10 fichiers Conform**, **7 schémas Zod locaux**, **8 fichiers `*.types.ts`**,
**0 test**.

> 🟡 `users`, `administrators` et `dashboard` tournent sur des **données
> mockées** inlinées dans `servers/*.loader.ts` — aucun domaine API
> correspondant n'existe. Elles se migrent quand même (structure, RHF), mais ne
> peuvent pas basculer sur `@app/contracts` tant que l'API n'expose pas ces
> domaines. **Ne pas créer de contrat spéculatif** pour du mock.

---

## 2. Écarts par rapport à la convention

| #   | Écart                                                                           | Étape |
| --- | ------------------------------------------------------------------------------- | ----- |
| 1   | Schémas Zod locaux au lieu de `@app/contracts/<domaine>`                        | E6    |
| 2   | Types d'API redéclarés à la main (8 fichiers `*.types.ts`)                      | E6    |
| 3   | 🟡 Conform restant sur 3 features du dashboard (`auth` + `events` migrés)       | E7    |
| 4   | `features/<f>/<f>.types.ts` au lieu de `features/<f>/types/<f>.types.ts`        | E7    |
| 5   | `shared/lib/api-client.ts` : le fichier devrait s'appeler `api-fetch.ts`        | E11   |
| 6   | `fetch` hors `servers/` : `context/dashboard.tsx` — **lot dédié**, pas E7       | —     |
| 7   | 🟡 Socle de test posé, 23 cas sur `shared/` — les features restent à couvrir    | E10   |
| 8   | `tsconfig.json` autonome (ne dérive pas de `@app/typescript-config`)            | E4    |
| 9   | Reliquats Next dans les deps (`next-themes`, `@tailwindcss/postcss`, `postcss`) | E3    |

✅ Déjà conforme : `features/<f>/{components,servers,lib}`, layout unique
`shared/components/dashboard-layout.tsx`, `requireAdminSession` en tête de
chaque loader.

> `CLAUDE.md` documente un `fetch` dans `shared/components/topbar.tsx`. Le code
> a bougé : c'est aujourd'hui `dashboard-context.tsx`. Corriger la doc au
> passage.

---

## 3. E6 — Bascule sur `@app/contracts`

**Branches** `migration-e6-contracts-<domaine>` (PR partagée avec l'API et le
client) · **2 j au total**.

### 3.1 Correspondance schémas locaux → contrats

| Schéma local                                | Contrat cible             | Migrable ?            |
| ------------------------------------------- | ------------------------- | --------------------- |
| `features/events/events.schema.ts`          | `@app/contracts/events`   | ✅                    |
| `features/qr/generate/generate.schema.ts`   | `@app/contracts/qr-codes` | ✅                    |
| `features/auth/login/login.schema.ts`       | `@app/contracts/auth`     | ✅                    |
| `features/auth/forgot-password/*.schema.ts` | `@app/contracts/auth`     | ✅                    |
| `features/auth/reset-password/*.schema.ts`  | `@app/contracts/auth`     | ✅                    |
| `features/profile/profile.schema.ts`        | `@app/contracts/auth`     | ✅                    |
| `features/administrators/*.schema.ts`       | —                         | 🟡 mock — reste local |

### 3.2 Schémas admin-only

Certains schémas n'ont pas d'équivalent client : filtres de listes admin,
changement de statut de modération, génération de lots de QR. Ils vont **quand
même** dans `@app/contracts`, dans le dossier de leur domaine — c'est l'API qui
les consomme en face, donc ils sont bien partagés front ↔ back. Exemples cibles
:

```
contracts/src/lost-items/moderate-lost-item.schema.ts
contracts/src/lost-items/admin-list-lost-items.schema.ts
contracts/src/sticker-orders/update-sticker-order-status.schema.ts
contracts/src/contact-messages/update-contact-message-status.schema.ts
contracts/src/qr-codes/generate-qr-tokens.schema.ts
```

Ils correspondent aux DTO `admin-list-*.query.dto.ts` et
`update-*-status.dto.ts` de l'API.

---

## 4. E7 — Conform → react-hook-form

**Branches** `migration-e7-rhf-<feature>` · **scope** `admin/<feature>` · **~1 j
pour admin**, dont ~0,25 j pour la tranche E7.0 ci-dessous.

Prérequis : **E7.1** (`packages/ui`) — ✅ **passée**. Voir
[MIGRATION-PLAN-CLIENT.md](MIGRATION-PLAN-CLIENT.md) §4.1 pour le gabarit de
conversion (corrigé : `Controller` + famille `Field`, pas `FormField` /
`FormItem`), §4.2 pour le gabarit de formulaire, et §4.6 pour les dépendances
`react-hook-form` / `@hookform/resolvers` désormais déclarées dans `apps/admin`.

`FormInputField` et `FormTextareaField` sont disponibles via
`@app/ui/components/form`, à côté des versions Conform qui restent en place
jusqu'à la migration de leurs derniers consommateurs — côté admin
`events/components/event-form-dialog.tsx` (E7.B),
`qr/generate/components/generate-qr-form.tsx` (E7.C) et
`administrators/components/admin-form-dialog.tsx` (E7.E).

**Prérequis bloquant : le socle du contrat action/formulaire, absent de
`apps/admin` — ✅ livré par E7.0.** Ce paragraphe ne demandait que le hook
`useActionFetcher` ; il datait d'avant E13.7, qui a livré le contrat complet —
et côté client seulement. `apps/admin/app/shared/` n'avait que `constants/`,
`helpers/` et `utils/`. Les **quatre** fichiers manquants ont été recopiés
depuis `apps/client`, à l'octet près, dans une tranche **E7.0** avant E7.A :

| Fichier                              | Rôle                                                         |
| ------------------------------------ | ------------------------------------------------------------ |
| `shared/types/action.ts`             | `ActionResult`, `FormErrors`                                 |
| `shared/helpers/form.ts`             | `zodErrorToFieldErrors` — `ZodError` → erreurs par champ     |
| `shared/utils/api-operation.ts`      | `withApiOperationError`, `getApiErrorMessage`                |
| `shared/hooks/use-action-fetcher.ts` | `useActionFetcher` — le dossier `hooks/` n'existe pas encore |

Recopier, pas mutualiser : le socle remonte dans `@app/web-kit` en **E11**, une
fois les deux copies stabilisées. Voir [MIGRATION-PLAN.md](MIGRATION-PLAN.md)
§E13.7, « Deux points ouverts ». Les quatre fichiers sont donc
**byte-identiques** à ceux du client, pour que la remontée en E11 soit un simple
déplacement : aucune divergence à réconcilier, y compris dans les commentaires
de `useActionFetcher` (dont l'avertissement sur la `key` vaut pour les deux
apps, même si les dialogues qu'il cite en preuve vivent côté client).

`withApiOperationError` accepte `redirectOnUnauthorized` — côté admin, c'est
`/auth/login`, et il complète `requireAdminSession` que chaque loader appelle
déjà. `apps/admin` a déjà `react-hook-form`, `@hookform/resolvers` et `zod` dans
son `package.json` (E7.1, §4.6), et son `shared/utils/api-fetch.ts` exporte la
même classe `ApiError` que le client : la recopie n'a demandé aucune adaptation.

**E7.0 n'a aucun consommateur, c'est assumé** : la tranche existe pour que E7.A
→ E7.E soient de petites PR. Le socle a donc été vérifié par un harness jetable
(27 assertions) plutôt que par un écran. **Ce harness a depuis été remplacé par
de vrais tests** (E10, §5) : les mêmes cas vivent en
`shared/{helpers,utils}/ __tests__/`, et `useActionFetcher` est couvert en
browser mode.

### Découpage des PR

| PR   | Feature          | Fichiers | Remarque                                             |
| ---- | ---------------- | -------- | ---------------------------------------------------- |
| E7.0 | `shared/`        | 4        | ✅ **fait** — socle recopié depuis `apps/client`     |
| E7.A | `auth`           | 3        | ✅ **fait** — login, forgot-password, reset-password |
| E7.B | `events`         | 3        | ✅ **fait** — + les 2 fetchers de `_index`           |
| E7.C | `qr/generate`    | 2        | génération de lots — **étend `ActionResult`**        |
| E7.D | `profile`        | 1        | changement de mot de passe                           |
| E7.E | `administrators` | 2        | 🟡 mock — convertir quand même                       |

**E7.C porte une décision de contrat.** Son action renvoie les jetons générés,
et la page les affiche : c'est l'un des deux seuls écrans du dépôt qui montre le
résultat de sa propre mutation. `ActionResult` n'a pas de canal pour ça et y
passe donc à `{ success: true; data?: T }`, dans le type partagé et en une fois.
E7.E n'en a pas besoin : son dialogue de liste renvoie l'entité et l'`intent`
par habitude, alors que la revalidation du loader par la soumission du fetcher
suffit — c'est ce que fait l'architecture de référence, qui n'a aucun canal de
retour. **E7.B l'a confirmé** : son action ne renvoyait `event` que pour que le
toast de changement de statut nomme le nouveau statut, or l'appelant connaît
déjà celui qu'il a demandé.

### À traiter dans la même étape

- **Écart 4** : `features/<f>/<f>.types.ts` → `features/<f>/types/<f>.types.ts`
  (8 fichiers).
- **Écart 6** : `shared/components/dashboard-context.tsx` fait un `fetch`
  client-side du compteur de notifications non lues. Le faire passer par le
  loader du layout, ou documenter l'exception.
- Corriger la mention obsolète de `topbar.tsx` dans `CLAUDE.md`.

---

## 5. E10 — Tests — 🟡 socle fait

**Branche** `migration-e10-admin-tests` · **scope** `admin/tests`.

Le socle a été posé **avant E7.A** : deux projects Vitest (`ui` en browser mode
Chromium, `node` pour les modules purs), `app/shared/helpers/testing.ts` comme
point d'entrée unique, tests en `__tests__/` à côté du fichier testé. Détail de
la mécanique et des pièges dans le §E10 du plan racine. Pas de `test-setup/` :
les deux fichiers correspondants de la référence sont vides.

Livré avec le socle, 23 cas sur le contrat action/formulaire d'E7.0 —
`zodErrorToFieldErrors`, `withApiOperationError` / `getApiErrorMessage`,
`resolveRouteMeta`, et le `useActionFetcher` en browser mode. Ils remplacent le
harness jetable d'E7.0.

**Reste à faire** : les tests de formulaire de chaque tranche E7 (E7.A → E7.E),
puis les priorités ci-dessous.

### Priorités de couverture

Chemins de la structure cible (E13) :

| Cible                                         | Pourquoi                                                   |
| --------------------------------------------- | ---------------------------------------------------------- |
| `shared/helpers/session.server.ts`            | `requireAdminSession` — le contrôle d'accès du back-office |
| `routes/dashboard/*/servers/*.loader.ts`      | redirection si session absente ou rôle non-admin           |
| `routes/dashboard/posts/servers/*.action.ts`  | modération — transitions d'état                            |
| `routes/dashboard/orders/servers/*.action.ts` | changement de statut de commande                           |
| `components/data-table.tsx`                   | composant transverse, tri / pagination                     |

> **À vérifier explicitement** : que la modération et les changements de statut
> sont refusés côté **API** aussi, pas seulement masqués dans l'UI admin. C'est
> un point de la checklist de l'agent `security-auditor`.

---

## 6. E11 — Mutualisation (part admin)

Voir [MIGRATION-PLAN-PACKAGES.md](MIGRATION-PLAN-PACKAGES.md) §5. Côté admin :

- `shared/lib/api-client.ts` → `@app/web-kit/api`
- `shared/components/theme-toggle.tsx`, `not-found.tsx` → `@app/web-kit`
- `shared/components/theme-context.tsx` → `@app/web-kit/theme`
- `shared/auth/auth-client.ts` **reste local** (plugin `adminClient()`)
- `shared/components/{data-table,stat-card,bento-card,page-header,sidebar,topbar}.tsx`
  **restent locaux** — spécifiques au back-office

---

## 7. Dette hors périmètre migration

À traiter séparément, mentionné ici pour mémoire :

| Sujet                                           | Note                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `users`, `administrators`, `dashboard` sur mock | Nécessitent de vrais domaines API. Prévoir un `@app/api` `users` / `admins` / `stats` étoffé. |
| `recharts` 2 → 3 (E3)                           | Le dashboard est le seul consommateur — vérifier visuellement.                                |
| `next-themes`                                   | Reliquat Next : à remplacer par le `theme-context` maison ou à assumer.                       |

---

## 8. Vérification par PR

```bash
pnpm --filter @app/admin run typecheck
pnpm --filter @app/admin run lint
pnpm --filter @app/admin run test     # les deux projects (ui + node)
pnpm run format:check
```

Sur la feature touchée :

- [ ] plus aucun import `@conform-to/*`
- [ ] le formulaire et l'action partagent **le même** schéma, importé de
      `@app/contracts`
- [ ] `requireAdminSession` est le **premier** appel de chaque loader / action
      non public
- [ ] la règle d'autorisation existe aussi côté API, pas seulement dans l'UI
- [ ] aucun `fetch` hors `servers/` (ou exception documentée dans `CLAUDE.md`)
- [ ] types de la feature sous `types/<feature>.types.ts`
- [ ] passage manuel sur chaque formulaire converti
