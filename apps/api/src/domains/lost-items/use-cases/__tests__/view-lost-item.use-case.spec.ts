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

	describe('a published listing', () => {
		it('counts the view of an anonymous visitor', async () => {
			const lostItem = buildLostItem({ views: 5 })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCase.execute({ id: 'lost-item-1' })

			expect(repository.incrementViews).toHaveBeenCalledWith('lost-item-1')
			expect(result).toEqual({ ...lostItem, views: 6 })
		})

		it('counts the view of a signed-in visitor who is not the author', async () => {
			const lostItem = buildLostItem({ userId: 'user-1', views: 5 })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCase.execute({
				id: 'lost-item-1',
				viewerId: 'user-2',
			})

			expect(repository.incrementViews).toHaveBeenCalledOnce()
			expect(result.views).toBe(6)
		})

		/** An author re-reading their own listing is not an audience figure. */
		it('does not count the author reading their own listing', async () => {
			const lostItem = buildLostItem({ userId: 'user-1', views: 5 })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			const result = await useCase.execute({
				id: 'lost-item-1',
				viewerId: 'user-1',
			})

			expect(repository.incrementViews).not.toHaveBeenCalled()
			expect(result).toEqual(lostItem)
		})
	})

	describe('an unpublished listing', () => {
		it.each(['pending', 'hidden'] as const)(
			'is returned to its author when %s, without counting a view',
			async moderationStatus => {
				const lostItem = buildLostItem({ userId: 'user-1', moderationStatus })
				vi.mocked(repository.findById).mockResolvedValue(lostItem)

				const result = await useCase.execute({
					id: 'lost-item-1',
					viewerId: 'user-1',
				})

				expect(result).toEqual(lostItem)
				expect(repository.incrementViews).not.toHaveBeenCalled()
			},
		)

		/** The leak this closes: a third party reading a listing under moderation. */
		it('answers not found to an anonymous visitor', async () => {
			vi.mocked(repository.findById).mockResolvedValue(
				buildLostItem({ userId: 'user-1', moderationStatus: 'pending' }),
			)

			await expect(useCase.execute({ id: 'lost-item-1' })).rejects.toThrow(
				LostItemNotFoundError,
			)
			expect(repository.incrementViews).not.toHaveBeenCalled()
		})

		it('answers not found to a signed-in visitor who is not the author', async () => {
			vi.mocked(repository.findById).mockResolvedValue(
				buildLostItem({ userId: 'user-1', moderationStatus: 'pending' }),
			)

			await expect(
				useCase.execute({ id: 'lost-item-1', viewerId: 'user-2' }),
			).rejects.toThrow(LostItemNotFoundError)
			expect(repository.incrementViews).not.toHaveBeenCalled()
		})
	})

	it('throws when the listing does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', viewerId: 'user-1' }),
		).rejects.toThrow(LostItemNotFoundError)
		expect(repository.incrementViews).not.toHaveBeenCalled()
	})
})
