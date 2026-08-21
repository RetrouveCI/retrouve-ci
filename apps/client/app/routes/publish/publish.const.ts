import {
	LOST_ITEM_CATEGORIES,
	MAX_PHOTOS,
	type LostItemCategory,
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
