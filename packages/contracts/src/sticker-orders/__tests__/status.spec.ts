import { describe, expect, it } from 'vitest'
import { STICKER_ORDER_STATUSES } from '../sticker-orders.const'
import { stickerOrderStatusSchema } from '../status.schema'
import { updateStickerOrderStatusSchema } from '../update-status.schema'

describe('stickerOrderStatusSchema', () => {
	// The union was declared four times before this slice: twice in the API, once
	// in each front.
	it('covers the five statuses an order moves through', () => {
		expect(STICKER_ORDER_STATUSES).toEqual([
			'pending',
			'processing',
			'shipped',
			'delivered',
			'cancelled',
		])
	})

	it.each(STICKER_ORDER_STATUSES)('accepts %s', status => {
		expect(stickerOrderStatusSchema.safeParse(status).success).toBe(true)
	})

	it('refuses an unknown status, in French', () => {
		const result = stickerOrderStatusSchema.safeParse('rembourse')

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe('Statut invalide')
	})
})

describe('updateStickerOrderStatusSchema', () => {
	it('accepts a known status', () => {
		expect(
			updateStickerOrderStatusSchema.safeParse({ status: 'shipped' }).data,
		).toEqual({ status: 'shipped' })
	})

	it('refuses an unknown one, in French', () => {
		expect(
			updateStickerOrderStatusSchema.safeParse({ status: 'rembourse' }).error
				?.issues[0]?.message,
		).toBe('Statut invalide')
	})
})
