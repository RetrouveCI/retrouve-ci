import { describe, expect, it } from 'vitest'
import type { Sticker } from '@/shared/types/sticker'
import {
	buildActivationLabel,
	buildRemainingLabel,
	buildStickerSummary,
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
	stickerWith('generated', 'g1'),
	stickerWith('revoked', 'r1'),
]

describe('buildStickerSummary', () => {
	it('counts every bucket and « Tous » over all of them', () => {
		const summary = buildStickerSummary(STICKERS)

		expect(summary.total).toBe(4)
		expect(summary.counts).toEqual({
			all: 4,
			activated: 2,
			generated: 1,
			revoked: 1,
		})
	})

	it('measures activation over every sticker owned', () => {
		expect(buildStickerSummary(STICKERS).ratio).toBe(0.5)
	})

	it('does not divide by zero on an empty account', () => {
		const summary = buildStickerSummary([])

		expect(summary.ratio).toBe(0)
		expect(summary.counts.all).toBe(0)
	})

	it('ignores a status the enumeration does not carry', () => {
		const rogue = { ...stickerWith('activated'), status: 'archived' }

		const summary = buildStickerSummary([
			rogue as Sticker,
			stickerWith('activated', 'a1'),
		])

		expect(summary.counts.activated).toBe(1)
		expect(summary.total).toBe(2)
	})
})

describe('filterStickers', () => {
	it('keeps everything under « Tous », revoked included', () => {
		expect(filterStickers(STICKERS, 'all')).toHaveLength(4)
	})

	it.each([
		['activated', 2],
		['generated', 1],
		['revoked', 1],
	] as const)('narrows to %s', (filter, expected) => {
		expect(filterStickers(STICKERS, filter)).toHaveLength(expected)
	})
})

describe('buildActivationLabel', () => {
	it('reads « 2 sur 4 activés »', () => {
		expect(buildActivationLabel(buildStickerSummary(STICKERS))).toBe(
			'2 sur 4 activés',
		)
	})

	it('stays singular at one', () => {
		expect(
			buildActivationLabel(buildStickerSummary([stickerWith('activated')])),
		).toBe('1 sur 1 activé')
	})
})

describe('buildRemainingLabel', () => {
	it('names what is left to activate', () => {
		expect(buildRemainingLabel(buildStickerSummary(STICKERS))).toBe(
			'1 en attente',
		)
	})

	it('says nothing when none is waiting, rather than « 0 restants »', () => {
		expect(
			buildRemainingLabel(buildStickerSummary([stickerWith('activated')])),
		).toBeNull()
	})

	it('does not count a revoked sticker as waiting', () => {
		expect(
			buildRemainingLabel(buildStickerSummary([stickerWith('revoked')])),
		).toBeNull()
	})
})
