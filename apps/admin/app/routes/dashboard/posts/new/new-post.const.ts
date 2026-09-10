/** The API refuses above this too; checked here so the refusal is instant. */
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024

export const ALLOWED_PHOTO_TYPES: readonly string[] = [
	'image/jpeg',
	'image/png',
	'image/webp',
]

export const TYPE_OPTIONS = [
	{
		value: 'found',
		label: 'Objet trouvé',
		hint: 'L’objet est au bureau ou chez la personne qui l’a trouvé.',
	},
	{
		value: 'lost',
		label: 'Objet perdu',
		hint: 'Quelqu’un a perdu cet objet et le cherche.',
	},
] as const
