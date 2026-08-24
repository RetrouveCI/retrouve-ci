import { describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import { StickerOrderNotFoundError } from '../../errors/sticker-order.errors'
import { requireStickerOrder } from '../require-sticker-order'

describe('requireStickerOrder', () => {
	it('returns the order when it exists', async () => {
		const repository = buildRepository()
		const order = buildStickerOrder()
		vi.mocked(repository.findById).mockResolvedValue(order)

		expect(await requireStickerOrder(repository, 'order-1')).toEqual(order)
	})

	it('throws when it does not', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(requireStickerOrder(repository, 'missing')).rejects.toThrow(
			StickerOrderNotFoundError,
		)
	})

	/** Deliberately unscoped: the admin status update reads any order. */
	it('does not narrow by owner', async () => {
		const repository = buildRepository()
		const order = buildStickerOrder({ userId: 'somebody-else' })
		vi.mocked(repository.findById).mockResolvedValue(order)

		expect(await requireStickerOrder(repository, 'order-1')).toEqual(order)
	})
})
