---
name: frontend-conventions
description: Structure et règles front-end React + React Router v7 (arborescence app/routes/). À utiliser pour créer ou modifier du code front — routes, components, hooks, mappers, schémas, et la couche servers (service/loader/action) — ou pour savoir où placer un fichier front.
---

# Front-end — `app/routes/` (React Router v7)

Chaque page est un dossier sous `app/routes/`, qui porte tout ce qui lui est
propre. Ce qui sert à plusieurs routes remonte d'un cran : au dossier de zone
s'il ne concerne que ses sous-routes, à `app/shared/` sinon.

```
app/
├── routes/
│   └── <zone>/<page>/
│       ├── _index.tsx         # LA page — le nom de fichier compte, voir plus bas
│       ├── components/        # Composants UI locaux (kebab-case.tsx)
│       ├── hooks/             # Hooks UI locaux (use-*.ts)
│       ├── helpers/           # Helpers locaux, dont les *.client.ts
│       ├── mappers/           # DTO API → ViewModel
│       ├── servers/           # Couche data — SEUL endroit avec des fetch
│       │   ├── *.service.ts   # Appels HTTP
│       │   ├── *.loader.ts    # Chargement de données
│       │   └── *.action.ts    # Mutations
│       ├── types/             # Types propres à la page ([page].types.ts)
│       ├── __tests__/         # Tests colocalisés
│       └── *.const.ts         # Constantes locales
├── components/                # Composants utilisés par plusieurs routes
├── context/                   # Contextes React (auth.tsx, theme.tsx…)
└── shared/
    ├── constants/  helpers/  hooks/  mappers/  types/  utils/
```

Un **dossier de zone** peut porter les `components/`, `servers/`, `types/` et
`hooks/` que ses sous-routes partagent — voir `routes/publish/` et `routes/auth/`
côté client, `routes/dashboard/qr/` et `routes/dashboard/users/` côté admin. Le
dossier de la zone est alors lui-même une route (`_index.tsx`) ou un simple
conteneur.

## ⚠️ `routes.ts` résout les modules par chemin

Le fichier de configuration `app/routes.ts` désigne chaque module de route par
une **chaîne de caractères**, pas par un import. Déplacer ou renommer un
`_index.tsx`, un `layout.tsx` ou un loader monté en route sans corriger
`routes.ts` **passe le `typecheck` sans broncher** et n'échoue qu'au `build`.
Après toute manipulation de fichiers sous `routes/`, lancer `pnpm build`.

Corollaire : les modules de route (`_index.tsx`, `layout.tsx`, `not-found.tsx`)
vivent sous `routes/`, jamais dans `components/` ni dans `shared/`.

Le typegen dérive aussi ses chemins du nom du fichier : une page `_index.tsx`
importe ses types depuis `./+types/_index`, un `layout.tsx` depuis
`./+types/layout`.

## `servers/` — Couche data

Toute interaction back-end (API, loaders, mutations) est isolée ici. **Aucun
`fetch` en dehors de ce dossier**, à une exception près : les appels que le
navigateur doit faire lui-même parce qu'il a besoin du `Set-Cookie` en direct
(session d'auth). Ceux-là vont dans un `helpers/*.client.ts` de la route, et
chaque exception est documentée dans `CLAUDE.md`.

- `*.service.ts` : appels HTTP via `apiFetch(request, path, init)` — **une**
  requête par fonction (forward de la session, gestion d'erreur `ApiError`).
- `*.loader.ts` : loaders React Router v7.
- `*.action.ts` : mutations ; valident l'input avec un schéma `zod` avant
  l'appel service.

> Nommage du client API : `*Fetch` = **fonction** qui exécute une requête ;
> `*Client` = **objet à méthodes** (réservé aux SDK, ex. client d'auth). Le
> client API maison est donc `apiFetch`, pas `apiClient`.

Un hook ne fait jamais d'appel HTTP directement — il utilise les fonctions de
`servers/`.

## Contrat action / formulaire

Une action ne renvoie jamais une forme ad hoc. Elle renvoie l'`ActionResult` de
`shared/types/action.ts` :

```ts
type ActionResult = { success: true } | { success: false; errors?: FormErrors }
```

`errors` est déjà au format `FieldErrors` de react-hook-form : une entrée par
champ, plus `root` pour ce qui n'appartient à aucun champ. Deux helpers la
construisent, jamais du code à la main :

- `zodErrorToFieldErrors` (`shared/helpers/form.ts`) — transforme l'erreur d'un
  `safeParse` en cette map ; les issues de niveau formulaire atterrissent sur
  `root`.
- `withApiOperationError` (`shared/utils/api-operation.ts`) — enveloppe l'appel
  service : `{ success: true }` si tout passe, `root` si c'est une `ApiError`,
  re-`throw` pour le reste. L'option `redirectOnUnauthorized` convertit un 401
  en `redirect()` au lieu d'une erreur de formulaire.

```ts
export async function contactAction({
	request,
}: {
	request: Request
}): Promise<ActionResult> {
	const submission = contactSchema.safeParse(
		Object.fromEntries(await request.formData()),
	)
	if (!submission.success) {
		return { success: false, errors: zodErrorToFieldErrors(submission.error) }
	}

	return withApiOperationError(() =>
		submitContactMessage(submission.data, request),
	)
}
```

Côté formulaire, `useActionFetcher` (`shared/hooks/use-action-fetcher.ts`) expose
`{ data, isOk, errors, isSubmitting, submit, Form, state }`, et `errors` est
passé tel quel à l'option `errors:` de `useForm` : les messages du serveur se
posent sur les champs auxquels ils appartiennent, sans code de recopie.

```tsx
const fetcher = useActionFetcher<typeof action, ContactInput>()

const form = useForm<ContactInput, unknown, ContactData>({
	resolver: standardSchemaResolver(contactSchema),
	mode: 'onSubmit',
	errors: fetcher.errors,
	reValidateMode: 'onChange',
	defaultValues: INITIAL_VALUES,
})

useEffect(() => {
	if (!fetcher.isOk) return
	toast.success('Message envoyé.')
}, [fetcher.isOk])
```

- `root` s'affiche avec `FormRootError` de `@app/ui/components/form`, en tête de
  formulaire.
- Les effets de succès (toast, navigation, fermeture d'un dialogue) vivent dans
  un `useEffect` gardé sur `fetcher.isOk` — pas de callback passé au hook. Y
  ajouter un drapeau `hasSubmitted` dès que l'effet fait quelque chose qui ne
  doit pas être rejoué : `isOk` reste vrai après coup, donc un changement de
  dépendance relancerait la navigation ou refermerait le dialogue.
- La **clé** de fetcher de `useActionFetcher` n'est **pas** nécessaire pour
  isoler deux formulaires. `useFetcher` fait `useState(key || useId())` : chaque
  appel possède déjà son propre fetcher, y compris deux instances du même
  composant, puisque chacune est un appel de hook distinct. Vérifié sur les cinq
  dialogues de `account/settings`, qui postent tous vers la même action et
  restent indépendants sans clé. N'en passer une que pour **partager** l'état
  d'un fetcher entre composants, ou pour le garder vivant à travers un
  démontage.

## `mappers/`

Transforment les réponses API (DTO) en ViewModels prêts pour l'affichage. Un
composant reçoit un **ViewModel**, jamais un DTO brut. Un mapper utilisé par
plusieurs zones va dans `app/shared/mappers/`.

## `helpers/` vs `utils/`

Le partage suit ce qui est couplé à l'app et ce qui ne l'est pas :

- `shared/utils/` — générique, ne connaît rien du domaine : `date.ts`,
  `initials.ts`, `api-fetch.ts`, `phone.ts`.
- `shared/helpers/` — couplé à l'app : ses endpoints, ses constantes de marque,
  son code serveur — `session.server.ts`, `auth-client.ts`, `page-meta.ts`.
- `shared/constants/` — tables statiques, sans logique.

Il n'y a **pas** de dossier `lib/`.

## Schémas de validation

Aujourd'hui chaque route possède son schéma en fichier voisin (`*.schema.ts`),
et l'`*.action.ts` **re-valide côté serveur avec le même schéma**. La cible est
un package de contrats partagé (`@app/contracts`, étape E5/E6 du plan de
migration), importé à la fois par le formulaire et par l'action, et par le
back-end. D'où l'absence de `*.validators.ts` local.

## `types/`

Les types propres à une page vivent dans son sous-dossier `types/`, fichier
`[page].types.ts` (variantes wire `*ApiDto` incluses). Les types partagés entre
zones vont dans `app/shared/types/`.

## Règles d'or

- ❌ Pas de `fetch` direct dans un composant ou un hook → passer par
  `servers/*.service.ts` (ou un `helpers/*.client.ts` documenté).
- ❌ Pas de logique de transformation dans un composant → utiliser un `mapper`.
- ❌ Type / composant / mapper partagé déclaré dans une route → le remonter au
  dossier de zone, ou dans `app/shared/` s'il traverse les zones.
- ❌ Pas de module de route en dehors de `routes/`.
- ✅ Le formulaire et l'action valident avec le **même** schéma.
- ✅ Une action renvoie `ActionResult` — jamais une forme ad hoc, jamais un
  message d'erreur nu.
- ❌ Pas de toast comme seul canal d'erreur d'un formulaire : une erreur de
  champ se pose sur le champ, le reste sur `root`.

## Conventions de nommage

| Élément          | Convention                 | Exemple                       |
| ---------------- | -------------------------- | ----------------------------- |
| Page             | `_index.tsx`               | `routes/posts/_index.tsx`     |
| Layout           | `layout.tsx`               | `routes/auth/layout.tsx`      |
| Composants       | `kebab-case.tsx`           | `listing-card.tsx`            |
| Hooks            | `use-kebab-case.ts`        | `use-posts-filters.ts`        |
| Services         | `[page].service.ts`        | `lost-items.service.ts`       |
| Loaders          | `[page].loader.ts`         | `lost-items.loader.ts`        |
| Actions          | `[page].action.ts`         | `lost-items.action.ts`        |
| Appels navigateur| `[sujet].client.ts`        | `helpers/phone-auth.client.ts`|
| Schémas          | `[page].schema.ts`         | `login.schema.ts`             |
| Mappers          | `[entity].mapper.ts`       | `lost-item.mapper.ts`         |
| Types            | `types/[page].types.ts`    | `types/publish.types.ts`      |
| Constantes       | `[page].const.ts`          | `publish.const.ts`            |

## Où créer mes fichiers ?

| Situation                          | Chemin cible                              |
| ---------------------------------- | ----------------------------------------- |
| Nouvelle page                      | `app/routes/<zone>/<page>/_index.tsx` + son dossier, **et** une entrée dans `app/routes.ts` |
| Composant d'une seule page         | `app/routes/<zone>/<page>/components/`    |
| Composant partagé par les sous-routes d'une zone | `app/routes/<zone>/components/` |
| Composant partagé entre zones      | `app/components/[component-name].tsx`     |
| Contexte React                     | `app/context/[sujet].tsx`                 |
| Hook partagé                       | `app/shared/hooks/use-[nom].ts`           |
| Types partagés                     | `app/shared/types/[type-name].ts`         |
| Mapper partagé                     | `app/shared/mappers/[entity].mapper.ts`   |
| Helper couplé à l'app              | `app/shared/helpers/[nom].ts`             |
| Utilitaire générique               | `app/shared/utils/[nom].ts`               |
| Table de constantes                | `app/shared/constants/[nom].ts`           |
