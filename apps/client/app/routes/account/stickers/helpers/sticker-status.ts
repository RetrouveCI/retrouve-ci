import type { StickerStatus } from '@/shared/types/sticker'

export interface StickerStatusConfig {
	/** `null` on the normal case: an active sticker needs no exception. */
	label: string | null
	badge: string
	border: string
	dimmed: boolean
}

/**
 * The shape R13 gives a listing's state, over the sticker's single axis. Each
 * pair is named outright, since a badge paints a fixed surface.
 */
export const STICKER_STATUS: Record<StickerStatus, StickerStatusConfig> = {
	activated: {
		label: null,
		badge: '',
		border: 'border-primary-green/25',
		dimmed: false,
	},
	generated: {
		label: 'En attente',
		badge: 'bg-yellow-700 text-white',
		border: 'border-yellow-700/30',
		dimmed: false,
	},
	revoked: {
		label: 'Désactivé',
		badge: 'bg-neutral-600 text-white',
		border: 'border-border',
		dimmed: true,
	},
}

export const UNKNOWN_STICKER_STATUS: StickerStatusConfig = {
	label: 'État inconnu',
	badge: 'bg-muted text-muted-foreground',
	border: 'border-border',
	dimmed: false,
}

/** Widened by assignment rather than by a cast, so the map stays exhaustive. */
const LOOKUP: Partial<Record<string, StickerStatusConfig>> = STICKER_STATUS

export function stickerStatusFor(status: string): StickerStatusConfig {
	return LOOKUP[status] ?? UNKNOWN_STICKER_STATUS
}
