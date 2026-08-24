import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetPaginatedLostItemsUseCase } from '../get-paginated-lost-items.use-case'

describe('GetPaginatedLostItemsUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetPaginatedLostItemsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetPaginatedLostItemsUseCase(repository)
	})

	it('delegates the filter to the repository', async () => {
		const response = {
			items: [buildLostItem()],
			total: 1,
			page: 1,
			pageSize: 20,
		}
		vi.mocked(repository.list).mockResolvedValue(response)

		const filter = { page: 1, pageSize: 20 }

		expect(await useCase.execute(filter)).toEqual(response)
		expect(repository.list).toHaveBeenCalledWith(filter)
	})

	it('forwards the search term untouched', async () => {
		vi.mocked(repository.list).mockResolvedValue({
			items: [],
			total: 0,
			page: 1,
			pageSize: 20,
		})

		const filter = { page: 1, pageSize: 20, search: 'iPhone' }
		await useCase.execute(filter)

		expect(repository.list).toHaveBeenCalledWith(filter)
	})
})
