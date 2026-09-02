import type { StickerStatus } from '@/shared/types/sticker'

export type StickerFilter = 'all' | StickerStatus

interface StickerFilterDefinition {
	id: StickerFilter
	label: string
	/** The selected pill's colours: a fixed surface, so fixed ink. */
	activeClassName?: string
}

/**
 * « En attente » is deliberately not a pill: a generated sticker carries no
 * owner, so it is in nobody's list and that bucket could never be anything but
 * empty. The progress bar and the card at the foot of the list say what is
 * left, both fed by `/qr-codes/mine/summary`. « Désactivés » is the reverse
 * case — without it a revoked sticker is reachable from « Tous » and nowhere
 * else, the hole R13 closed on « Archivées ».
 */
export const STICKER_FILTERS: StickerFilterDefinition[] = [
	{ id: 'all', label: 'Tous' },
	{
		id: 'activated',
		label: 'Actifs',
		activeClassName: 'bg-primary-green border-primary-green text-white',
	},
	{
		id: 'revoked',
		label: 'Désactivés',
		activeClassName: 'bg-neutral-600 border-neutral-600 text-white',
	},
]
