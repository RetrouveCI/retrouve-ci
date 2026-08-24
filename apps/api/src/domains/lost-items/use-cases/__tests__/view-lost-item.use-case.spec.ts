import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { ViewLostItemUseCase } from '../view-lost-item.use-case'

describe('ViewLostItemUseCase', () => {
	let repository: LostItemRepository
	let useCase: ViewLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new ViewLostItemUseCase(repository)
	})

	it('increments the view count and returns the updated lost item', async () => {
		const lostItem = buildLostItem({ moderationStatus: 'published', views: 5 })
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		const result = await useCase.execute('lost-item-1')

		expect(repository.incrementViews).toHaveBeenCalledWith('lost-item-1')
		expect(result).toEqual({ ...lostItem, views: 6 })
	})

	it('throws when the item does not exist, without counting a view', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.incrementViews).not.toHaveBeenCalled()
	})

	it('throws when the item is not published, without counting a view', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ moderationStatus: 'pending' }),
		)

		await expect(useCase.execute('lost-item-1')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.incrementViews).not.toHaveBeenCalled()
	})
})
