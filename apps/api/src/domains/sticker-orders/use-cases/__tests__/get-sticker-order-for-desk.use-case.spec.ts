import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import { StickerOrderNotFoundError } from '../../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { GetStickerOrderForDeskUseCase } from '../get-sticker-order-for-desk.use-case'

describe('GetStickerOrderForDeskUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: GetStickerOrderForDeskUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetStickerOrderForDeskUseCase(repository)
	})

	// Whoever bought it: the route is admin-only, and that is the whole scope.
	it('returns any order, whoever bought it', async () => {
		const order = buildStickerOrder({ userId: 'user-9' })
		vi.mocked(repository.findById).mockResolvedValue(order)

		await expect(useCase.execute('order-1')).resolves.toEqual(order)
		expect(repository.findById).toHaveBeenCalledWith('order-1')
	})

	it('answers not found for an order that does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			StickerOrderNotFoundError,
		)
	})
})
