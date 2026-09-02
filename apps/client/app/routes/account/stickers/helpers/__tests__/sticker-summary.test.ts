import { describe, expect, it } from 'vitest'
import type { Sticker, StickerActivationSummary } from '@/shared/types/sticker'
import {
	activationRatio,
	buildActivationLabel,
	buildRemainingLabel,
	buildStickerCounts,
	filterStickers,
} from '../sticker-summary'

function stickerWith(status: Sticker['status'], id: string = status): Sticker {
	return {
		id,
		code: `RCI-${id.toUpperCase()}`,
		status,
		isActive: status === 'activated',
		label: null,
		linkedObject: null,
		activatedAt: null,
	}
}

const STICKERS: Sticker[] = [
	stickerWith('activated', 'a1'),
	stickerWith('activated', 'a2'),
	stickerWith('revoked', 'r1'),
]

function summary(
	overrides: Partial<StickerActivationSummary> = {},
): StickerActivationSummary {
	return { delivered: 12, activated: 3, pending: 9, ...overrides }
}

describe('buildStickerCounts', () => {
	it('counts every bucket and « Tous » over all of them', () => {
		expect(buildStickerCounts(STICKERS)).toEqual({
			all: 3,
			activated: 2,
			generated: 0,
			revoked: 1,
		})
	})

	it('counts nothing on an empty account', () => {
		expect(buildStickerCounts([]).all).toBe(0)
	})

	it('ignores a status the enumeration does not carry', () => {
		const rogue = { ...stickerWith('activated'), status: 'archived' }

		const counts = buildStickerCounts([
			rogue as Sticker,
			stickerWith('activated', 'a1'),
		])

		expect(counts.activated).toBe(1)
		expect(counts.all).toBe(2)
	})
})

describe('filterStickers', () => {
	it('keeps everything under « Tous », revoked included', () => {
		expect(filterStickers(STICKERS, 'all')).toHaveLength(3)
	})

	it.each([
		['activated', 2],
		['revoked', 1],
		['generated', 0],
	] as const)('narrows to %s', (filter, expected) => {
		expect(filterStickers(STICKERS, filter)).toHaveLength(expected)
	})
})

describe('buildActivationLabel', () => {
	/** The denominator is the pack bought, not the rows on screen. */
	it('reads « 3 sur 12 activés »', () => {
		expect(buildActivationLabel(summary())).toBe('3 sur 12 activés')
	})

	it('stays singular at one', () => {
		expect(
			buildActivationLabel(summary({ delivered: 4, activated: 1, pending: 3 })),
		).toBe('1 sur 4 activé')
	})
})

describe('buildRemainingLabel', () => {
	it('names what is left to activate', () => {
		expect(buildRemainingLabel(summary())).toBe('9 en attente')
	})

	it('says nothing at zero, rather than « 0 restants »', () => {
		expect(
			buildRemainingLabel(summary({ delivered: 4, activated: 4, pending: 0 })),
		).toBeNull()
	})
})

describe('activationRatio', () => {
	it('measures activation over the pack delivered', () => {
		expect(activationRatio(summary({ delivered: 4, activated: 2 }))).toBe(0.5)
	})

	it('does not divide by zero on an empty account', () => {
		expect(activationRatio({ delivered: 0, activated: 0, pending: 0 })).toBe(0)
	})
})
