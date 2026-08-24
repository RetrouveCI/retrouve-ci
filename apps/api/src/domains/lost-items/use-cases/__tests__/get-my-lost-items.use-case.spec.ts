import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetMyLostItemsUseCase } from '../get-my-lost-items.use-case'

describe('GetMyLostItemsUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetMyLostItemsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetMyLostItemsUseCase(repository)
	})

	it('narrows the list to the caller', async () => {
		const response = {
			items: [buildLostItem({ userId: 'user-1' })],
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
