# Frontend RetrouveCI — React Router v7 / Feature-based

> S'applique aux deux apps RetrouveCI : **admin** et **client**. Chacune a sa
> propre arborescence `features/`, mais peut partager du code via un package
> commun (`shared/` ou package workspace, ex: `packages/ui/`).

## Vue d'ensemble

```
src/
├── features/           # Toutes les fonctionnalités de l'app
│   └── [feature-name]/
│       ├── components/
│       ├── hooks/
│       ├── *.validators.ts
│       ├── mappers/
│       ├── *.const.ts
│       ├── *.types.ts
│       └── servers/
│           ├── *.service.ts
│           ├── *.loader.ts
│           └── *.actions.ts
└── index.ts
```

---

## `features/[feature-name]/` — Détail

### `components/`

Composants UI **locaux** à la feature.

```
features/lost-items/
└── components/
    ├── LostItemCard.tsx
    ├── LostItemForm.tsx
    └── LostItemFilters.tsx
```

> ⚠️ Composant réutilisé dans plusieurs features → `shared/components/` ou
> package UI partagé admin/client.

### `hooks/`

Hooks React encapsulant la logique UI locale.

```
hooks/
├── useLostItemFilters.ts
├── useQrScanner.ts
└── useMatchingNotifications.ts
```

**Règle :** un hook n'appelle jamais l'API directement — il passe par
`servers/`.

### `*.validators.ts`

Schémas de validation (Zod recommandé), partagés formulaire client ↔ action
server.

```ts
// lost-items.validators.ts
export const reportLostItemSchema = z.object({
	category: z.string(),
	description: z.string().min(10),
	location: z.string(),
	photos: z.array(z.string().url()).max(5),
})
```

### `mappers/`

Transformation DTO API → ViewModel.

```ts
// mappers/lost-item.mapper.ts
export function toLostItemViewModel(dto: LostItemDTO): LostItemViewModel {
	return {
		id: dto.id,
		title: dto.description.slice(0, 50),
		status: formatStatus(dto.status),
		reportedAt: formatDate(dto.createdAt),
		qrCodeUrl: dto.qrCode?.imageUrl ?? null,
	}
}
```

### `*.const.ts`

```ts
// lost-items.const.ts
export const ITEM_CATEGORIES = [
	'electronics',
	'documents',
	'keys',
	'bags',
	'other',
] as const
export const MAX_PHOTOS_PER_ITEM = 5
```

### `*.types.ts`

```ts
// lost-items.types.ts
export interface LostItemViewModel {
	id: string
	title: string
	status: 'pending' | 'matched' | 'returned'
	reportedAt: string
	qrCodeUrl: string | null
}
```

> Types partagés entre admin et client → `shared/types/` (ou package commun).

---

### `servers/` — Couche data (React Router v7)

> Toute interaction avec l'API NestJS est isolée ici. **Aucun `fetch`/`axios` en
> dehors de ce dossier.**

#### `*.service.ts` — Appels HTTP

```ts
// servers/lost-items.service.ts
export async function fetchLostItems(filters: LostItemFilters) {
	return apiClient.get('/lost-items', { params: filters })
}

export async function reportLostItem(data: ReportLostItemInput) {
	return apiClient.post('/lost-items', data)
}
```

#### `*.loader.ts` — Chargement de données

```ts
// servers/lost-items.loader.ts
export async function lostItemsLoader({ request }: LoaderFunctionArgs) {
	const filters = getFiltersFromRequest(request)
	const dtos = await fetchLostItems(filters)
	return dtos.map(toLostItemViewModel)
}
```

#### `*.actions.ts` — Mutations

```ts
// servers/lost-items.actions.ts
export async function reportLostItemAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const validated = reportLostItemSchema.parse(Object.fromEntries(formData))
	return reportLostItem(validated)
}
```

---

## Exemples de features RetrouveCI

| App    | Feature          | Description                                   |
| ------ | ---------------- | --------------------------------------------- |
| client | `lost-items/`    | Déclarer un objet perdu, suivre son statut    |
| client | `found-items/`   | Signaler un objet retrouvé via scan QR        |
| client | `qr-scanner/`    | Scan de QR code (caméra)                      |
| admin  | `lost-items/`    | Liste/gestion des objets perdus (back-office) |
| admin  | `matching/`      | Validation manuelle des correspondances       |
| admin  | `users/`         | Gestion des utilisateurs                      |
| commun | `notifications/` | Affichage des notifications                   |
| commun | `auth/`          | Login, session                                |

---

## Règles de nommage

| Convention                   | Exemple                                        |
| ---------------------------- | ---------------------------------------------- |
| Composants                   | `PascalCase.tsx` → `LostItemCard.tsx`          |
| Hooks                        | `camelCase` préfixé `use` → `useQrScanner.ts`  |
| Services / loaders / actions | `[feature].[type].ts` → `lost-items.loader.ts` |
| Types                        | `[feature].types.ts` → `lost-items.types.ts`   |
| Constantes                   | `[feature].const.ts` → `lost-items.const.ts`   |

---

## Règles d'or

- ❌ Pas de `fetch`/`axios` direct dans un composant ou un hook
- ❌ Pas de transformation de données dans les composants — passer par
  `mappers/`
- ✅ Un composant reçoit toujours un **ViewModel**, jamais un DTO brut
- ✅ Validation partagée entre formulaire client (Zod) et action server
