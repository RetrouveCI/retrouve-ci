import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRepository } from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { CountDeliveredStickersUseCase } from '../count-delivered-stickers.use-case'

describe('CountDeliveredStickersUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: CountDeliveredStickersUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new CountDeliveredStickersUseCase(repository)
	})

	it('sums the quantities delivered to the caller', async () => {
		vi.mocked(repository.sumDeliveredQuantity).mockResolvedValue(12)

		await expect(useCase.execute('user-1')).resolves.toBe(12)
		expect(repository.sumDeliveredQuantity).toHaveBeenCalledWith('user-1')
	})

	it('answers zero when nothing has been delivered', async () => {
		vi.mocked(repository.sumDeliveredQuantity).mockResolvedValue(0)

		await expect(useCase.execute('user-1')).resolves.toBe(0)
	})
})
