import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository as buildLostItemRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { LostItemForbiddenError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import {
	buildListingComment,
	buildRepository,
	DESK,
	POSTER,
} from '../../__tests__/listing-comment.fixture'
import type { ListingCommentRepository } from '../../repository/listing-comment.repository'
import { GetListingThreadUseCase } from '../get-listing-thread.use-case'

describe('GetListingThreadUseCase', () => {
	let repository: ListingCommentRepository
	let lostItems: LostItemRepository
	let useCase: GetListingThreadUseCase

	beforeEach(() => {
		repository = buildRepository()
		lostItems = buildLostItemRepository()
		vi.mocked(lostItems.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)
		vi.mocked(repository.listThread).mockResolvedValue([])
		useCase = new GetListingThreadUseCase(repository, lostItems)
	})

	it('reads the thread in the caller’s scope', async () => {
		await useCase.execute({ lostItemId: 'lost-item-1', scope: POSTER })

		expect(repository.listThread).toHaveBeenCalledWith('lost-item-1', POSTER)
	})

	it('answers the thread without the authors’ account ids', async () => {
		vi.mocked(repository.listThread).mockResolvedValue([
			buildListingComment({ authorId: 'admin-1' }),
		])

		const [comment] = await useCase.execute({
			lostItemId: 'lost-item-1',
			scope: POSTER,
		})

		expect(comment).toMatchObject({ id: 'comment-1', authorSide: 'admin' })
		expect(comment).not.toHaveProperty('authorId')
	})

	it('refuses a poster the thread of a listing they do not own', async () => {
		await expect(
			useCase.execute({
				lostItemId: 'lost-item-1',
				scope: { side: 'owner', userId: 'user-2' },
			}),
		).rejects.toThrow(LostItemForbiddenError)
		expect(repository.listThread).not.toHaveBeenCalled()
	})

	it('lets the desk read the thread of any listing', async () => {
		vi.mocked(lostItems.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-2' }),
		)

		await expect(
			useCase.execute({ lostItemId: 'lost-item-1', scope: DESK }),
		).resolves.toEqual([])
	})
})
