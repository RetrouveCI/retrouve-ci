import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	buildStickerOrder,
} from '../../__tests__/sticker-order.fixture'
import type { StickerOrderRepository } from '../../repository/sticker-order.repository'
import { GetMyStickerOrdersUseCase } from '../get-my-sticker-orders.use-case'

describe('GetMyStickerOrdersUseCase', () => {
	let repository: StickerOrderRepository
	let useCase: GetMyStickerOrdersUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyStickerOrdersUseCase(repository)
	})

	it('narrows the list to the caller', async () => {
		const response = {
			items: [buildStickerOrder({ userId: 'user-1' })],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const filter = { page: 1, pageSize: 20 }
		const result = await useCase.execute({ userId: 'user-1', filter })

		expect(repository.list).toHaveBeenCalledWith({
			...filter,
			userId: 'user-1',
		})
		expect(result).toEqual(response)
	})

	/** The scoping rule: a filter cannot widen the scope to somebody else. */
	it('overrides a userId carried by the filter', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		await useCase.execute({
			userId: 'user-1',
			filter: { page: 1, pageSize: 20, userId: 'user-2' },
		})

		expect(repository.list).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 'user-1' }),
		)
	})
})
