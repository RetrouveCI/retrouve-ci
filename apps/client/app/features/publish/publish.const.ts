export const OBJECT_TYPES = [
	{ value: 'phone', label: 'Téléphone' },
	{ value: 'keys', label: 'Clés' },
	{ value: 'wallet', label: 'Portefeuille' },
	{ value: 'bag', label: 'Sac' },
	{ value: 'electronics', label: 'Électronique' },
	{ value: 'clothing', label: 'Vêtement' },
	{ value: 'jewelry', label: 'Bijoux' },
	{ value: 'documents', label: 'Documents' },
	{ value: 'other', label: 'Autre' },
]

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

export const TYPE_TO_CATEGORY: Record<string, string> = {
	phone: 'phones',
	keys: 'keys',
	wallet: 'wallets',
	bag: 'bags',
	electronics: 'electronics',
	clothing: 'other',
	jewelry: 'other',
	documents: 'other',
	other: 'other',
}
