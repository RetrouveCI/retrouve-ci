import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { GetPaginatedStickerOrdersUseCase } from '../get-paginated-sticker-orders.use-case'

describe('GetPaginatedStickerOrdersUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: GetPaginatedStickerOrdersUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPaginatedStickerOrdersUseCase(repository)
	})

	it('delegates the filter to the repository', async () => {
		const response = {
			items: [buildStickerOrder()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const filter = { page: 1, pageSize: 20 }

		expect(await useCase.execute(filter)).toEqual(response)
		expect(repository.list).toHaveBeenCalledWith(filter)
	})

	/** The admin list is deliberately unscoped. */
	it('adds no owner of its own', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({ page: 1, pageSize: 20 })

		expect(repository.list).toHaveBeenCalledWith(
			expect.not.objectContaining({ userId: expect.anything() }),
		)
	})
})
