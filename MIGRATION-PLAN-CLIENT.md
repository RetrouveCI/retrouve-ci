# Plan de migration — `apps/client` (`@app/client`)

> Décliné de [MIGRATION-PLAN.md](MIGRATION-PLAN.md). Couvre la part client des
> étapes **E6**, **E7**, **E10**, **E11**. Convention cible : skill
> `frontend-conventions` (React Router v7 · `app/routes/`).
>
> ⚠️ **Les sections d'inventaire et d'écarts ci-dessous décrivent la structure
> d'avant E13** (`app/features/<f>/`). Elles sont conservées telles quelles : ce
> sont les constats qui ont motivé les étapes, pas une description de l'état
> courant. Depuis #46 et #47, l'app est sur `app/routes/<zone>/<page>/` — voir
> §3.6 et §5/E13 du plan racine, et le skill `frontend-conventions`.
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

**Posé en E7.2, mais réduit** : la référence passe par un hook partagé
`useActionFetcher` (`shared/hooks/`) qui enveloppe `useFetcher` et expose
`errors` (au format `FieldErrors`), `isOk`, `isSubmitting` et `Form` — l'option
`errors:` de `useForm` refermant la boucle erreurs serveur → champs.

La moitié `errors` **n'a pas été livrée en E7.2**, faute de consommateur :
l'inventaire des `*.action.ts` montrait alors que seules deux actions
renvoyaient des erreurs par champ, `publish` et `account/posts/edit`, toutes
deux via `submission.reply()` de Conform. Les treize autres — dont les cinq de
`auth` — renvoyaient `{ ok, error }` et affichaient des toasts.

> **Livré depuis, en E13.7** : le pont `errors` → champs existe. Les actions
> renvoient `ActionResult` (`{ success, errors }`), `useActionFetcher` expose
> `errors` au format `FieldErrors`, et les formulaires le passent à l'option
> `errors:` de `useForm`. Voir §E13.7 de [MIGRATION-PLAN.md](MIGRATION-PLAN.md)
> pour le détail, dont les six routes encore sur Conform qui gardent l'ancienne
> forme jusqu'à leur étape E7.x. Le paragraphe ci-dessous décrit donc l'état
> E7.2, conservé pour la trace.

Ce qui est livré, dans `apps/client` seulement : `useActionFetcher` expose
`submit`, `data` et `isSubmitting`, et déclenche `onOk` / `onError` **une seule
fois par réponse**. C'est ce dernier point qui justifie le hook : `fetcher.data`
survit à sa propre soumission, et les cinq `useEffect` qu'il remplace devaient
chacun s'en prémunir — avec un état supplémentaire (`submittedPhone`) et, dans
quatre cas sur cinq, un
`// eslint-disable-next-line react-hooks/exhaustive-deps`. Comparer l'identité
de la réponse supprime les deux. La copie `apps/admin` viendra avec la première
feature admin migrée, pas avant — candidat `@app/web-kit` en E11, les deux
copies étant alors identiques.

### 4.3 Découpage des PR (client)

| PR     | Feature                  | Fichiers | Remarque                                                      |
| ------ | ------------------------ | -------- | ------------------------------------------------------------- |
| E7.1   | `packages/ui`            | 3 (+2)   | ✅ **fait** — wrappers RHF sur `ui/field.tsx` + deps des apps |
| E7.2   | `auth` (7 formulaires)   | 12       | ✅ **fait** — voir §4.3.1                                     |
| E7.3   | `contact`                | 3        | ✅ **fait** — voir §4.3.2                                     |
| E7.4   | `publish` (multi-étapes) | 7        | le plus délicat : 3 sections + hook `use-publish-form`        |
| E7.5   | `account/settings`       | 5        | 4 dialogues + danger zone                                     |
| E7.6   | `account/posts/edit`     | 3        | hook `use-edit-post-form`                                     |
| (E7.7) | `stickers`, `qr-contact` | 6        | ⏸️ seulement si les features sont réactivées                  |

#### 4.3.1 E7.2 — `auth` : ce qui a été fait

**Sept formulaires, pas cinq.** Le décompte initial comptait « phone » une fois
alors que `password-forgotten/components/phone-form.tsx` et
`register/components/phone-step-section.tsx` sont deux formulaires distincts,
sur deux schémas distincts. Les 12 fichiers : 7 composants, 4 `*.schema.ts` (des
types `…Input` / `…Data` exportés, que `useForm<Input, unknown, Output>`
réclame) et le hook `shared/hooks/use-action-fetcher.ts`.

**Les wrappers de E7.1 ne servent pas ici.** Aucun des sept formulaires
n'utilisait `InputField` / `TextareaField` : tous ont un balisage sur mesure —
le bloc préfixe `+225`, le `PasswordInput` avec son œil, les slots `InputOTP`.
Ils passent donc par `Controller` nu, et par `useController` pour les deux
formulaires de mot de passe, dont `PasswordStep` prend les deux champs dans un
contrat de props plat qu'un render prop par champ ne peut alimenter sans
imbriquer l'un dans l'autre. C'est le cas de figure que §4.1 annonçait comme
possible ; il s'avère être la totalité de `auth`.

**Rendu inchangé, à l'octet près.** Le `FieldError` de `@app/ui/components/form`
n'importe rien de Conform — c'est un `<p class="text-destructive text-xs">`
purement présentationnel, et §4.5 ne le retire pas. Les composants d'étape
gardent donc leur contrat `errors?: string[]`, alimenté par
`fieldState.error?.message`, et le DOM produit est identique. Le passage à la
famille `Field` (`<div role="alert" class="… text-sm">`, espacements
`flex-col gap-3` au lieu de `space-y-2`) est un sujet UI à part, à trancher avec
une vérification visuelle — pas un sujet de bibliothèque de formulaires.

**Un seul changement de comportement, assumé.** Le gabarit §4.2 impose
`reValidateMode: 'onChange'`. Cinq des sept formulaires ne déclaraient pas de
`shouldRevalidate` côté Conform et revalidaient donc à la soumission suivante ;
leurs erreurs s'effacent désormais à la frappe. Les deux formulaires de mot de
passe étaient déjà en `shouldRevalidate: 'onInput'`, soit l'équivalent exact.

**Vérification.** `format:check`, `typecheck`, `lint`, `test` (188) et `build`
verts. Faute d'accès navigateur, le contrôle réel est un harness jsdom jetable
(esbuild en CJS, `react-router` / `sonner` / le client auth stubés) montant les
sept vrais composants : **22 assertions**, toutes vertes — blocage à la
validation, valeur _parsée_ et non brute transmise au handler (la parité avec
`submission.value` de Conform), charge utile et `intent` de chaque soumission,
`confirmPassword` non envoyé, erreur d'auth rendue, toasts et navigations,
expiration puis renvoi du code OTP, code refusé qui vide le champ. Reste à voir
à l'œil : les 5 pages sous `/auth`.

#### 4.3.2 E7.3 — `contact` : ce qui a été fait

**Trois fichiers, pas un.** Le décompte initial ne comptait que le composant.
S'y ajoutent l'action, qui passe au contrat `{ success, errors }` de E13.7, et
le schéma, qui gagne les exports de types `ContactInput` / `ContactData` que
`useForm<Input, unknown, Output>` réclame — comme les quatre schémas `auth`. Les
règles de validation, elles, ne bougent pas.

**L'action perd ses `data(..., { status })`.** Un formulaire invalide répondait
en HTTP 400. Ce n'est pas une erreur de transport : la requête a été comprise,
et le serveur a quelque chose à dire sur quatre champs précis. Sous le nouveau
contrat c'est un 200 portant `{ success: false, errors }` — et c'est aussi ce
qui permet aux messages d'atterrir sur leurs champs.

**Le balisage sur mesure est conservé** : `Controller` habille les éléments
existants, et les trois champs texte identiques passent par un `TextField` local
au fichier. Le rendu ne bouge donc pas d'un pixel, ce qui est le seul argument
qui tienne — faute d'accès navigateur, une dérive visuelle ne serait vue par
personne avant la prod.

> **Correction.** Ce paragraphe affirmait d'abord qu'utiliser l'`Input` partagé
> aurait « silencieusement remplacé l'anneau vert par le gris par défaut », et
> qu'`auth` avait déjà perdu le sien depuis E7.2. **C'est faux, et l'utilisateur
> l'a vérifié à l'œil : les 5 pages `/auth` sont bonnes.**
>
> Le conflit de classes, lui, est réel : la page stylise ses contrôles en
> `focus:` (`focus:ring-primary-green/30 focus:ring-2`), l'`Input` partagé
> stylise son anneau en `focus-visible:`
> (`focus-visible:ring-ring/50 focus-visible:ring-[3px]`), les deux sélecteurs
> matchent un champ texte focalisé, et le CSS généré place bien les règles
> `focus-visible` après les `focus` (vérifié dans
> `build/client/assets/root-*.css` : ~103 300 pour `focus:ring-2`, ~106 130 pour
> `focus-visible:ring-[3px]`). À spécificité égale, `focus-visible` gagne, donc
> les surcharges `focus:` sont du **code mort**.
>
> Mais la conséquence annoncée ne suit pas : `--ring` vaut
> `oklch(0.52 0.15 145)` — teinte 145, le vert de la marque, choisi exprès. Ce
> qui gagne est donc un anneau vert lui aussi, simplement à 50 % d'opacité sur 3
> px au lieu de 30 % sur 2 px. Invisible en pratique, et il n'y a **rien à
> corriger dans `auth`** au-delà d'un éventuel nettoyage des classes mortes.
>
> Ce qui rend `FormInputField` / `FormTextareaField` inadaptés à cette page
> reste vrai, mais pour l'autre raison, plus banale : leur `Field` +
> `FieldLabel` change les espacements et la taille des messages (voir le
> paragraphe `FieldError` ci-dessous).

**`FieldError` : celui de shadcn, contrairement à E7.2.** §4.3.1 avait gardé la
version Conform de `@app/ui/components/form` pour un DOM identique à l'octet, et
renvoyait le passage à la famille `Field` à un arbitrage UI. `contact` prend
l'autre voie, pour une raison concrète : la version Conform attend
`errors: string[]`, et l'adaptateur qui fait la conversion (`toErrorList`) vit
dans `routes/auth/helpers/` — inatteignable depuis une autre zone sans le
recopier ou le remonter. La version shadcn prend directement
`errors={[fieldState.error]}`, c'est ce que font les wrappers de `packages/ui`,
et c'est ce que prescrit le commentaire en tête de
`packages/ui/src/components/form/index.ts`. Avec `className="text-xs"` la taille
d'origine est conservée ; il ne reste comme écart que `<div role="alert">` au
lieu de `<p>`, soit un gain d'accessibilité. Les formulaires `auth` pourront
converger en fin d'étape, quand les wrappers Conform disparaîtront (§4.5).

⚠️ Le garde `fieldState.error &&` n'est pas décoratif : `errors={[undefined]}`
fait rendre au composant shadcn une liste à puces vide. `FormInputField` se
garde de la même façon.

**Pas de drapeau `hasSubmitted`.** Le succès échange le formulaire contre son
écran de confirmation, depuis un `useEffect` gardé sur `fetcher.isOk`.
Contrairement à `password-forgotten`, l'effet ne navigue pas : il pose un état
local idempotent, qu'un rejeu ne dérange pas. Le cas à connaître est l'inverse —
après « Envoyer un autre message », `fetcher.isOk` est **toujours vrai** ;
l'effet ne rejoue pas parce que ses dépendances n'ont pas changé, et la
soumission suivante le relance grâce à son cycle faux → vrai.

Au passage, les libellés gagnent un `htmlFor` et les contrôles un `id` : ils
n'étaient associés à rien.

**Vérification.** `format:check`, `typecheck`, `lint`, `test` et `build` verts.
Harness jsdom jetable, le vrai `ContactForm` monté dans un `createMemoryRouter`
câblé sur le vrai `contactAction`, `fetch` stubé par _factory_ : **52
assertions**, toutes vertes — 20 sur l'action (corps transmis, trim, les quatre
erreurs de champ sans `root`, API jamais appelée si la validation échoue,
`ApiError` → `root` seul, message vide → message par défaut, non-`ApiError`
re-levée) et 32 sur le formulaire (soumission vide bloquée côté client, erreur
`root` serveur dans l'alerte, erreur de champ serveur sous son champ avec les
valeurs conservées, succès → écran de confirmation, retour à un formulaire vide
et propre, puis **une seconde soumission qui réaffiche bien la confirmation**).
Reste à voir à l'œil : à quoi ressemble un échec serveur, maintenant une alerte
`FormRootError` en tête de formulaire là où il y avait un toast.

### 4.4 À traiter dans la même étape

- **Écart 4** : ✅ **absorbé par E13.3** — les 5 fichiers `<f>.types.ts` ont été
  repliés dans `types/` au moment où leur dossier a bougé, plutôt que feature
  par feature.
- **Écart 6** : `shared/components/activity-hub.tsx` fait un `fetch` hors
  `servers/`. Soit le déplacer dans un loader, soit documenter l'exception dans
  `CLAUDE.md` comme les deux appels d'auth qui ont besoin du `Set-Cookie` en
  direct.

### 4.5 Fin d'étape — ✅ faite en E7.G

Retirer `@conform-to/react` et `@conform-to/zod` de `apps/client/package.json`,
`apps/admin/package.json`, `packages/ui/package.json` et du catalog. C'est aussi
là que `components/form/{input-field,textarea-field}.tsx` disparaissent, une
fois leurs 8 consommateurs migrés.

**Cette fin d'étape n'est pas atteignable depuis le client seul.** Les 10
fichiers Conform de `apps/admin` doivent être migrés d'abord (tranches E7.0 →
E7.E, voir [MIGRATION-PLAN-ADMIN.md](MIGRATION-PLAN-ADMIN.md) §4), et les 8
consommateurs des deux wrappers Conform se répartissent 4 / 4 entre les deux
apps (`grep -rln "InputField\|TextareaField" apps/*/app`). E7.6 terminée ne clôt
donc que la moitié client de l'étape.

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
