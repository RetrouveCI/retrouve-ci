import {
	LOST_ITEM_CATEGORIES,
	MAX_PHOTOS,
	type LostItemCategory,
	type LostItemType,
} from '@app/contracts/lost-items'

export { MAX_PHOTOS }

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 Mo
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// The contract owns the categories; this app owns what they are called. Keying
// the labels by category is what turns a missing one into a type error.
const CATEGORY_LABELS: Record<LostItemCategory, string> = {
	phone: 'Téléphone',
	keys: 'Clés',
	wallet: 'Portefeuille',
	bag: 'Sac',
	electronics: 'Électronique',
	clothing: 'Vêtement',
	jewelry: 'Bijoux',
	documents: 'Documents',
	other: 'Autre',
}

export const OBJECT_TYPES = LOST_ITEM_CATEGORIES.map(value => ({
	value,
	label: CATEGORY_LABELS[value],
}))

export const LOST_TIPS = [
	'Soyez précis sur la couleur et la marque',
	'Ajoutez une photo pour de meilleurs résultats',
	'Mentionnez le lieu exact de la perte',
	'Vos coordonnées restent privées',
]

export const FOUND_TIPS = [
	'Ajoutez une photo pour aider le propriétaire',
	"Décrivez l'état et les détails visibles",
	"Précisez où vous conservez l'objet",
	'Répondez rapidement aux messages',
]

/**
 * The two accents §2.1 assigns, kept together so no screen of the tunnel picks
 * one on its own: a lost object is the orange flat with dark ink — never white,
 * which measures 2,70:1 — and a found one the brand green with white.
 */
export const PUBLISH_ACCENT: Record<
	LostItemType,
	{ cssVar: string; fill: string; segment: string; ring: string }
> = {
	lost: {
		cssVar: 'var(--accent-orange)',
		fill: 'bg-accent-orange text-accent-orange-foreground hover:bg-accent-orange-dark',
		segment: 'bg-accent-orange',
		ring: 'focus-visible:ring-accent-orange/40',
	},
	found: {
		cssVar: 'var(--primary-green)',
		fill: 'bg-primary-green text-white hover:bg-primary-green-dark',
		segment: 'bg-primary-green',
		ring: 'focus-visible:ring-primary-green/40',
	},
}
