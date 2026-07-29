# Plan de migration — `apps/client` (`@app/client`)

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre la part client des
> étapes **E6**, **E7**, **E10**, **E11**. Convention cible : skill
> `frontend-conventions` (React Router v7 · feature-based).
>
> Rappel méthode : une étape = une branche = une PR `gh` = une session, et **on
> demande la permission avant tout commit** (signatures GPG).

---

## 1. Inventaire

App publique (port 3000), React Router v7 SSR, auth better-auth par **numéro de
téléphone**.

| Feature         | Fichiers | Schémas Zod | Formulaires Conform | Statut                        |
| --------------- | -------- | ----------- | ------------------- | ----------------------------- |
| `account`       | 47       | 1           | 6                   | actif                         |
| `auth`          | 30       | 4           | 6                   | actif                         |
| `publish`       | 29       | 1           | 7                   | actif                         |
| `lost-items`    | 17       | —           | —                   | actif                         |
| `stickers`      | 17       | 1           | 4                   | 🚫 désactivé (exclu tsconfig) |
| `notifications` | 10       | 1           | —                   | actif                         |
| `contact`       | 9        | 1           | 1                   | actif                         |
| `qr-contact`    | 7        | 1           | 2                   | 🚫 désactivé (exclu tsconfig) |
| `about`         | 7        | —           | —                   | actif                         |
| `home`          | 6        | —           | —                   | actif                         |
| `download`      | 5        | —           | —                   | 🚫 démonté (route commentée)  |
| `terms`         | 1        | —           | —                   | actif                         |
| `privacy`       | 1        | —           | —                   | actif                         |

**29 fichiers Conform**, **10 schémas Zod locaux**, **5 fichiers `*.types.ts`**,
**0 test**.

> ⚠️ `account/orders`, `account/stickers` et `qr-contact` sont **exclus du
> `tsconfig.json`**. Décider en amont : les réactiver d'abord, ou les exclure
> aussi de la migration. **Pas d'entre-deux** — du code non typé qu'on migre à
> l'aveugle est du code qu'on casse.

---

## 2. Écarts par rapport à la convention

| #   | Écart                                                                                                              | Étape |
| --- | ------------------------------------------------------------------------------------------------------------------ | ----- |
| 1   | Schémas Zod locaux à la feature au lieu de `@app/contracts/<domaine>`                                              | E6    |
| 2   | Types d'API redéclarés à la main (`lost-items.types.ts`, `shared/types/*.ts`) — duplication silencieuse avec l'API | E6    |
| 3   | Formulaires en Conform au lieu de react-hook-form                                                                  | E7    |
| 4   | `features/<f>/<f>.types.ts` au lieu de `features/<f>/types/<f>.types.ts`                                           | E7    |
| 5   | `shared/lib/api-client.ts` : le fichier devrait s'appeler `api-fetch.ts`                                           | E11   |
| 6   | `fetch` hors `servers/` non documenté : `shared/components/activity-hub.tsx`                                       | E7    |
| 7   | Aucun test                                                                                                         | E10   |
| 8   | `tsconfig.json` autonome (ne dérive pas de `@app/typescript-config`)                                               | E4    |

✅ Déjà conforme : arborescence
`features/<f>/{components,hooks,mappers,servers,lib}`, couche `servers/` avec
`*.service.ts` / `*.loader.ts` / `*.action.ts`, `shared/` bien découpé,
composants en `kebab-case.tsx`, `index.tsx` fin qui délègue aux sections.

---

## 3. E6 — Bascule sur `@app/contracts`

**Branches** `migration-e6-contracts-<domaine>` (PR partagée avec l'API) · **2 j
au total**.

Chaque PR d'E6 traite **un domaine de bout en bout** : contrat + API + client +
admin. C'est ce qui garantit qu'aucune duplication ne survit à la PR.

### 3.1 Correspondance schémas locaux → contrats

| Schéma local                                     | Contrat cible                             |
| ------------------------------------------------ | ----------------------------------------- |
| `features/auth/login/login.schema.ts`            | `@app/contracts/auth`                     |
| `features/auth/register/register.schema.ts`      | `@app/contracts/auth`                     |
| `features/auth/password-forgotten/*.schema.ts`   | `@app/contracts/auth`                     |
| `features/auth/reset-password/*.schema.ts`       | `@app/contracts/auth`                     |
| `features/account/settings/settings.schema.ts`   | `@app/contracts/auth` (profil)            |
| `features/contact/contact.schema.ts`             | `@app/contracts/contact-messages`         |
| `features/publish/publish.schema.ts`             | `@app/contracts/lost-items`               |
| `features/notifications/notifications.schema.ts` | `@app/contracts/notifications`            |
| `features/stickers/order/order.schema.ts`        | `@app/contracts/sticker-orders` (différé) |
| `features/qr-contact/qr-contact.schema.ts`       | `@app/contracts/qr-codes` (différé)       |

### 3.2 Types d'API

Les `*ApiDto` de `features/<f>/<f>.types.ts` et de `shared/types/*.ts` sont
redéclarés à la main face aux réponses de l'API. Deux options :

- **(a)** les dériver du contrat (`z.output<typeof …>`) quand la réponse est
  contractualisée ;
- **(b)** les garder locaux quand ils décrivent un **ViewModel** (sortie de
  mapper), ce qui est légitime — la convention veut justement qu'un composant
  reçoive un ViewModel, pas un DTO brut.

Faire le tri par fichier : `lost-items.types.ts` mélange aujourd'hui les deux.

### 3.3 Point de vigilance : les actions

`servers/*.action.ts` doit valider avec **le même schéma** que le formulaire.
C'est déjà le cas avec Conform ; ça doit le rester avec RHF (E7). L'import
bascule simplement vers `@app/contracts/<domaine>`.

---

## 4. E7 — Conform → react-hook-form

**Branches** `migration-e7-rhf-<feature>` · **scope** `client/<feature>` ·
**~1,5 j pour client**.

### 4.1 Ordre : `packages/ui` d'abord

`packages/ui/src/components/form/{input-field,textarea-field}.tsx` sont bâtis
sur Conform et consommés par les deux apps. Ils doivent être réécrits sur RHF
**avant** toute feature, dans leur propre PR (`scope: ui/form`).

Bonne nouvelle : `packages/ui/src/components/ui/form.tsx` — le composant shadcn
officiel bâti sur `react-hook-form` (`FormField`, `FormItem`, `FormControl`,
`FormMessage`) — **existe déjà et n'est pas utilisé**. La cible est de s'appuyer
dessus et de supprimer `components/form/`.

### 4.2 Gabarit de conversion

**Avant** (Conform) :

```tsx
const [form, fields] = useForm({
  constraint: getZodConstraint(loginSchema),
  onValidate: ({ formData }) => parseWithZod(formData, { schema: loginSchema }),
})
<Form method="post" {...getFormProps(form)}>
  <InputField field={fields.phone} label="Téléphone" />
</Form>
```

**Après** (react-hook-form, gabarit de la référence) :

```tsx
const form = useForm<LoginInput>({
  resolver: standardSchemaResolver(loginSchema),
  defaultValues: { phone: '' },
})
const fetcher = useFetcher<typeof action>()

const onSubmit = form.handleSubmit((values) =>
  fetcher.submit(values, { method: 'post' }),
)

<Form {...form}>
  <form onSubmit={onSubmit}>
    <FormField
      control={form.control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Téléphone</FormLabel>
          <FormControl><Input {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

Côté serveur, `servers/*.action.ts` continue de re-valider avec **le même
schéma** — RHF ne change rien à cette règle.

### 4.3 Découpage des PR (client)

| PR     | Feature                  | Fichiers | Remarque                                                    |
| ------ | ------------------------ | -------- | ----------------------------------------------------------- |
| E7.1   | `packages/ui`            | 2 (+1)   | **prérequis** — réécrit `form/`, s'appuie sur `ui/form.tsx` |
| E7.2   | `auth` (5 formulaires)   | 6        | login, phone, OTP ×2, create-password, new-password         |
| E7.3   | `contact`                | 1        | le plus simple — bon second pilote                          |
| E7.4   | `publish` (multi-étapes) | 7        | le plus délicat : 3 sections + hook `use-publish-form`      |
| E7.5   | `account/settings`       | 5        | 4 dialogues + danger zone                                   |
| E7.6   | `account/posts/edit`     | 3        | hook `use-edit-post-form`                                   |
| (E7.7) | `stickers`, `qr-contact` | 6        | ⏸️ seulement si les features sont réactivées                |

### 4.4 À traiter dans la même étape

- **Écart 4** : déplacer `features/<f>/<f>.types.ts` →
  `features/<f>/types/<f>.types.ts` (5 fichiers), au moment où l'on touche la
  feature.
- **Écart 6** : `shared/components/activity-hub.tsx` fait un `fetch` hors
  `servers/`. Soit le déplacer dans un loader, soit documenter l'exception dans
  `CLAUDE.md` comme les deux appels d'auth qui ont besoin du `Set-Cookie` en
  direct.

### 4.5 Fin d'étape

Retirer `@conform-to/react` et `@conform-to/zod` de `apps/client/package.json`,
`apps/admin/package.json`, `packages/ui/package.json` et du catalog.

---

## 5. E10 — Tests

**Branche** `migration-e10-tests-front` · **scope** `client/tests` · **~0,75 j
pour client**.

Aujourd'hui : **zéro test**. Mise en place :

1. `vite.config.ts` → deux projects Vitest sur le modèle de la référence :
   - `ui` — browser mode (`@vitest/browser-playwright` +
     `vitest-browser-react`), fichiers `app/**/*.test.tsx`
   - `node` — loaders / actions / mappers, fichiers `app/**/*.test.ts`
2. `test-setup/setup.ts` + `test-setup/global-setup.ts`.
3. Scripts `test`, `test:ui`, `test:node`, `test:watch` dans `package.json`.
4. Tests dans `__tests__/` en miroir du code, nommés `<name>.test.ts(x)`.

### Priorités de couverture

| Cible                                        | Pourquoi                                           |
| -------------------------------------------- | -------------------------------------------------- |
| `features/*/mappers/*.mapper.ts`             | pur input → output, meilleur rapport valeur/effort |
| `features/*/servers/*.loader.ts`             | session requise, redirections, erreurs API         |
| `features/*/servers/*.action.ts`             | validation, chemins d'erreur, `intent` multiples   |
| `features/publish/hooks/use-publish-form.ts` | logique multi-étapes, la plus dense de l'app       |
| `shared/lib/api-fetch.ts`                    | gestion `ApiError`, 204, corps non JSON            |

Cf. skill `unit-tests` : comportement et branches, pas d'assertion sur les mocks
internes.

---

## 6. E11 — Mutualisation (part client)

Voir [MIGRATION-PLAN-PACKAGES.md](MIGRATION-PLAN-PACKAGES.md) §5. Côté client :

- `shared/lib/api-client.ts` → consommé depuis `@app/web-kit/api`
- `shared/components/theme-toggle.tsx`, `shared/components/not-found*.tsx` →
  `@app/web-kit`
- `shared/theme/*` → `@app/web-kit/theme`
- `shared/auth/auth-client.ts` **reste local** (plugin `phoneNumberClient`)

---

## 7. Vérification par PR

```bash
pnpm --filter @app/client run typecheck
pnpm --filter @app/client run lint
pnpm --filter @app/client run test     # à partir d'E10
pnpm run format:check
```

Sur la feature touchée :

- [ ] plus aucun import `@conform-to/*`
- [ ] le formulaire et l'action partagent **le même** schéma, importé de
      `@app/contracts`
- [ ] aucun `fetch` hors `servers/` (ou exception documentée dans `CLAUDE.md`)
- [ ] types de la feature sous `types/<feature>.types.ts`
- [ ] les composants reçoivent un ViewModel, pas un DTO brut
- [ ] passage manuel sur chaque formulaire converti (saisie, erreurs,
      soumission)
