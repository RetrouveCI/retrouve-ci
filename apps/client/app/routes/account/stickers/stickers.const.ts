import type { StickerStatus } from '@/shared/types/sticker'

export type StickerFilter = 'all' | StickerStatus

interface StickerFilterDefinition {
	id: StickerFilter
	label: string
	/** The selected pill's colours: a fixed surface, so fixed ink. */
	activeClassName?: string
}

/**
 * « Désactivés » is not in the artboard, which draws three pills. Without it a
 * revoked sticker is reachable from « Tous » and nowhere else — the very hole
 * R13 closed on « Archivées ».
 */
export const STICKER_FILTERS: StickerFilterDefinition[] = [
	{ id: 'all', label: 'Tous' },
	{
		id: 'activated',
		label: 'Actifs',
		activeClassName: 'bg-primary-green border-primary-green text-white',
	},
	{
		id: 'generated',
		label: 'En attente',
		activeClassName: 'bg-yellow-700 border-yellow-700 text-white',
	},
	{
		id: 'revoked',
		label: 'Désactivés',
		activeClassName: 'bg-neutral-600 border-neutral-600 text-white',
	},
]
