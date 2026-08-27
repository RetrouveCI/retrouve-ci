import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import { StickerOrderNotFoundError } from '../../errors/sticker-order.errors'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { UpdateStickerOrderStatusUseCase } from '../update-sticker-order-status.use-case'

describe('UpdateStickerOrderStatusUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: UpdateStickerOrderStatusUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateStickerOrderStatusUseCase(repository)
	})

	it('updates the status when the order exists', async () => {
		const updated = buildStickerOrder({ status: 'shipped' })
		vi.mocked(repository.findById).mockResolvedValue(buildStickerOrder())
		vi.mocked(repository.updateStatus).mockResolvedValue(updated)

		const result = await useCase.execute({ id: 'order-1', status: 'shipped' })

		expect(repository.updateStatus).toHaveBeenCalledWith('order-1', 'shipped')
		expect(result).toEqual(updated)
	})

	it('throws when the order does not exist, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', status: 'shipped' }),
		).rejects.toThrow(StickerOrderNotFoundError)
		expect(repository.updateStatus).not.toHaveBeenCalled()
	})

	/** An admin action: it checks no ownership, by design. */
	it('updates an order owned by somebody else', async () => {
		const updated = buildStickerOrder({ userId: 'user-9', status: 'delivered' })
		vi.mocked(repository.findById).mockResolvedValue(
			buildStickerOrder({ userId: 'user-9' }),
		)
		vi.mocked(repository.updateStatus).mockResolvedValue(updated)

		expect(
			await useCase.execute({ id: 'order-1', status: 'delivered' }),
		).toEqual(updated)
	})
})
