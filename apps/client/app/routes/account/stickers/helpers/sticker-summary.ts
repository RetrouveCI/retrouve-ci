import type { Sticker, StickerActivationSummary } from '@/shared/types/sticker'
import type { StickerFilter } from '../stickers.const'

export type StickerCounts = Record<StickerFilter, number>

/**
 * The pills count the list, the bar above counts the pack bought — waiting
 * stickers included, which only the API can tell. Two denominators, on purpose.
 */
export function buildStickerCounts(stickers: Sticker[]): StickerCounts {
	const counts: StickerCounts = {
		all: stickers.length,
		activated: 0,
		generated: 0,
		revoked: 0,
	}

	for (const sticker of stickers) {
		if (Object.hasOwn(counts, sticker.status)) counts[sticker.status] += 1
	}

	return counts
}

export function filterStickers(
	stickers: Sticker[],
	filter: StickerFilter,
): Sticker[] {
	return filter === 'all'
		? stickers
		: stickers.filter(sticker => sticker.status === filter)
}

export function buildActivationLabel(
	summary: StickerActivationSummary,
): string {
	const { activated, delivered } = summary
	return `${activated} sur ${delivered} activé${activated > 1 ? 's' : ''}`
}

/** Says nothing rather than « 0 restants » once the pack is fully activated. */
export function buildRemainingLabel(
	summary: StickerActivationSummary,
): string | null {
	return summary.pending === 0 ? null : `${summary.pending} en attente`
}

/** 0 to 1 over everything bought; `delivered` is floored on `activated`. */
export function activationRatio(summary: StickerActivationSummary): number {
	return summary.delivered === 0 ? 0 : summary.activated / summary.delivered
}
