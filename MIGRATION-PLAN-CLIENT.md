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

### 4.1 Ordre : `packages/ui` d'abord — ✅ fait (E7.1)

`packages/ui/src/components/form/{input-field,textarea-field}.tsx` sont bâtis
sur Conform et consommés par les deux apps. Le socle RHF devait être posé
**avant** toute feature, dans sa propre PR (`scope: ui/form`).

**Correction par rapport à la rédaction initiale de ce plan.** Deux points
avaient été mal anticipés :

- **On n'a pas pu « réécrire » les deux composants en PR isolée.** Ils ont 8
  fichiers consommateurs dans les apps qui leur passent des métadonnées Conform
  (`field: FieldMetadata<string>`) ; changer leur contrat de props aurait mis le
  typecheck au rouge, et convertir un consommateur oblige à convertir tout son
  formulaire — donc toute sa feature. Les versions Conform **restent donc en
  place jusqu'à leur dernier consommateur migré**, et la suppression de
  `components/form/` se fait en fin d'étape avec les dépendances `@conform-to/*`
  (§4.5).
- **La cible n'est pas `ui/form.tsx`.** L'architecture de référence n'utilise
  pas la famille shadcn `Form*` (`FormField`, `FormItem`, `FormControl`,
  `FormMessage`) : elle utilise `Controller` de `react-hook-form` directement,
  combiné à la famille **`Field`** (`Field`, `FieldLabel`, `FieldError`,
  `FieldGroup`) — le composant shadcn plus récent. Notre
  `packages/ui/src/components/ui/field.tsx` existe déjà et est déjà exporté par
  le barrel. `ui/form.tsx` reste donc inutilisé, comme avant l'étape.

Livré par E7.1 : `form-input-field.tsx` et `form-textarea-field.tsx`, exportant
`FormInputField` / `FormTextareaField`, bâtis sur `Controller` + `Field` et
reproduisant le balisage par champ de la référence. Ce sont des **wrappers
ergonomiques** — la référence, elle, réécrit ce balisage à la main dans chaque
formulaire. Divergence assumée : elle garde les 41 sites d'appel à une ligne
logique par champ, comme aujourd'hui avec Conform, ce qui rend la conversion
mécanique plutôt que réécrite — c'est la mitigation directe du risque « la
migration Conform → RHF régresse silencieusement » (§7 du plan racine). La
composition custom (ex. le préfixe `+225` de `publish/contact-section.tsx`)
reste possible avec les primitives `Field` brutes.

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

**Après** (react-hook-form). Le gabarit ci-dessous remplace celui de la
rédaction initiale, qui utilisait `FormField` / `FormItem` / `FormControl` /
`FormMessage` — ce n'est pas ce que fait la référence (voir §4.1) :

```tsx
const form = useForm<LoginInput, unknown, LoginData>({
  resolver: standardSchemaResolver(loginSchema),
  mode: 'onSubmit',
  reValidateMode: 'onChange',
  errors: fetcher.errors, // erreurs d'action réinjectées dans RHF
  defaultValues: { phone: '' },
})

<fetcher.Form onSubmit={form.handleSubmit(onSubmit)}>
  <FieldGroup>
    <FormInputField control={form.control} name="phone" label="Téléphone" />
  </FieldGroup>
</fetcher.Form>
```

`FormInputField` encapsule le balisage par champ de la référence, à savoir :

```tsx
<Controller
	control={control}
	name={name}
	render={({ field, fieldState }) => (
		<Field data-invalid={fieldState.invalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				{...field}
				value={field.value ?? ''}
				id={field.name}
				aria-invalid={fieldState.invalid}
			/>
			{fieldState.error && <FieldError errors={[fieldState.error]} />}
		</Field>
	)}
/>
```

Côté serveur, `servers/*.action.ts` continue de re-valider avec **le même
schéma** — RHF ne change rien à cette règle.

**Reste à poser en E7.2** : la référence passe par un hook partagé
`useActionFetcher` (`shared/hooks/`) qui enveloppe `useFetcher` et expose
`errors` (au format `FieldErrors`), `isOk`, `isSubmitting` et `Form`. C'est ce
qui alimente l'option `errors:` de `useForm` et referme la boucle erreurs
serveur → champs. Il n'a pas été livré en E7.1 : sa forme dépend de ce que
renvoient nos `*.action.ts`, qui n'est pas encore uniformisé. À écrire au début
de E7.2, dans les deux apps — candidat `@app/web-kit` en E11, les deux copies
étant identiques.

### 4.3 Découpage des PR (client)

| PR     | Feature                  | Fichiers | Remarque                                                      |
| ------ | ------------------------ | -------- | ------------------------------------------------------------- |
| E7.1   | `packages/ui`            | 3 (+2)   | ✅ **fait** — wrappers RHF sur `ui/field.tsx` + deps des apps |
| E7.2   | `auth` (5 formulaires)   | 6        | login, phone, OTP ×2, create-password, new-password           |
| E7.3   | `contact`                | 1        | le plus simple — bon second pilote                            |
| E7.4   | `publish` (multi-étapes) | 7        | le plus délicat : 3 sections + hook `use-publish-form`        |
| E7.5   | `account/settings`       | 5        | 4 dialogues + danger zone                                     |
| E7.6   | `account/posts/edit`     | 3        | hook `use-edit-post-form`                                     |
| (E7.7) | `stickers`, `qr-contact` | 6        | ⏸️ seulement si les features sont réactivées                  |

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
`apps/admin/package.json`, `packages/ui/package.json` et du catalog. C'est aussi
là que `components/form/{input-field,textarea-field}.tsx` disparaissent, une
fois leurs 8 consommateurs migrés.

### 4.6 Dépendances : blocage levé en E7.1

`react-hook-form` et `@hookform/resolvers` n'étaient déclarés que par
`packages/ui`. Ni `apps/client` ni `apps/admin` ne les listaient, ce qui rendait
E7.2 et suivantes impossibles : une feature qui appelle `useForm` ou
`standardSchemaResolver` ne pouvait pas les résoudre depuis une install propre.
Localement, la résolution retombait sur des résidus `.pnpm` d'une install
antérieure — `react-hook-form` 7.74.0 et `@hookform/resolvers` **3.10.0**, qui
n'expose même pas `standardSchemaResolver`.

Les deux paquets sont désormais déclarés `catalog:` dans les deux apps. Vérifié
: `apps/client`, `apps/admin` et `packages/ui` résolvent tous les trois le
**même chemin physique** `.pnpm/react-hook-form@7.71.1_react@19.2.8`. C'est la
condition qui garantit une instance unique : deux copies de `react-hook-form`
dans un même bundle donneraient deux contextes React distincts, et `Controller`
ne verrait pas le `control` du formulaire. Aucune des deux apps n'a de
`resolve.dedupe` dans sa config Vite pour rattraper ça.

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
