import type { Sticker } from '@/shared/types/sticker'
import type { StickerFilter } from '../stickers.const'

export interface StickerSummary {
	total: number
	counts: Record<StickerFilter, number>
	/** 0 to 1, over every sticker owned — the denominator the artboard shows. */
	ratio: number
}

export function buildStickerSummary(stickers: Sticker[]): StickerSummary {
	const counts: Record<StickerFilter, number> = {
		all: stickers.length,
		activated: 0,
		generated: 0,
		revoked: 0,
	}

	for (const sticker of stickers) {
		if (Object.hasOwn(counts, sticker.status)) counts[sticker.status] += 1
	}

	return {
		total: stickers.length,
		counts,
		ratio: stickers.length === 0 ? 0 : counts.activated / stickers.length,
	}
}

export function filterStickers(
	stickers: Sticker[],
	filter: StickerFilter,
): Sticker[] {
	return filter === 'all'
		? stickers
		: stickers.filter(sticker => sticker.status === filter)
}

export function buildActivationLabel(summary: StickerSummary): string {
	const { activated } = summary.counts
	return `${activated} sur ${summary.total} activé${activated > 1 ? 's' : ''}`
}

/**
 * « 9 restants » in the artboard assumes every sticker is either active or
 * waiting. A revoked one is neither, so the sentence names what is actually
 * left to activate rather than subtracting from the total.
 */
export function buildRemainingLabel(summary: StickerSummary): string | null {
	const pending = summary.counts.generated
	return pending === 0 ? null : `${pending} en attente`
}
