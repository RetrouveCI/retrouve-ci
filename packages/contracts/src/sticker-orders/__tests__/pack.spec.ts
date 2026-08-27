import { describe, expect, it } from 'vitest'
import {
	STICKER_PACKS,
	STICKER_PACKS_BY_ID,
	stickerPackIdSchema,
} from '../pack.schema'
import { DELIVERY_FEE, STICKER_PACK_IDS } from '../sticker-orders.const'

describe('stickerPackIdSchema', () => {
	it.each(STICKER_PACK_IDS)('accepts %s', id => {
		expect(stickerPackIdSchema.safeParse(id).success).toBe(true)
	})

	it('refuses an unknown id, in French', () => {
		const result = stickerPackIdSchema.safeParse('pack-100')

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Sélectionnez un pack')
	})
})

describe('the pack catalogue', () => {
	// The prices the API charges and the prices the order page shows used to be
	// two separate literals. One list now, so a change cannot land on one side.
	it('prices every pack the schema accepts', () => {
		expect(STICKER_PACKS.map(pack => [pack.id, pack.price])).toEqual([
			['pack-4', 2000],
			['pack-8', 3500],
			['pack-20', 7000],
		])
	})

	it('lists the packs in the declared order, and keys them by id', () => {
		expect(STICKER_PACKS.map(pack => pack.id)).toEqual([...STICKER_PACK_IDS])

		for (const id of STICKER_PACK_IDS) {
			expect(STICKER_PACKS_BY_ID[id].id).toBe(id)
		}
	})

	it('quotes one delivery fee', () => {
		expect(DELIVERY_FEE).toBe(1000)
	})
})
