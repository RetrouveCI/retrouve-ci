import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import {
	StickerOrderForbiddenError,
	StickerOrderNotFoundError,
} from '../../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { GetStickerOrderUseCase } from '../get-sticker-order.use-case'

describe('GetStickerOrderUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: GetStickerOrderUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetStickerOrderUseCase(repository)
	})

	it('returns the order to its owner', async () => {
		const order = buildStickerOrder({ userId: 'user-1' })
		vi.mocked(repository.findById).mockResolvedValue(order)

		expect(await useCase.execute({ id: 'order-1', userId: 'user-1' })).toEqual(
			order,
		)
	})

	/**
	 * Current behaviour, asserted rather than implied: this answers **forbidden**
	 * for somebody else's order, which confirms the id exists. `notifications`
	 * answers not found in the same situation.
	 */
	it("refuses somebody else's order", async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildStickerOrder({ userId: 'user-1' }),
		)

		await expect(
			useCase.execute({ id: 'order-1', userId: 'user-2' }),
		).rejects.toThrow(StickerOrderForbiddenError)
	})

	it('throws when the order does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', userId: 'user-1' }),
		).rejects.toThrow(StickerOrderNotFoundError)
	})
})
