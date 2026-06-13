import { describe, expect, it } from 'vitest'
import { InvalidStickerOrderError } from '../errors/sticker-order.errors'
import { validateCreateStickerOrder } from './sticker-order.validator'

const baseData = {
	packId: 'pack-4',
	paymentMethod: 'Orange Money',
	deliveryAddress: 'Cocody Riviera 3, Abidjan',
	deliveryCity: 'Abidjan',
	userId: 'user-1',
}

describe('validateCreateStickerOrder', () => {
	it('accepts a known pack id', () => {
		expect(() => validateCreateStickerOrder(baseData)).not.toThrow()
	})

	it('rejects an unknown pack id', () => {
		expect(() =>
			validateCreateStickerOrder({ ...baseData, packId: 'pack-unknown' }),
		).toThrow(InvalidStickerOrderError)
	})
})
