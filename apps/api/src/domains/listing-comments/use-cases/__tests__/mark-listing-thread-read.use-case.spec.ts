import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository as buildLostItemRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { LostItemForbiddenError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import {
	buildRepository,
	DESK,
	POSTER,
} from '../../__tests__/listing-comment.fixture'
import type { ListingCommentRepository } from '../../repository/listing-comment.repository'
import { MarkListingThreadReadUseCase } from '../mark-listing-thread-read.use-case'

describe('MarkListingThreadReadUseCase', () => {
	let repository: ListingCommentRepository
	let lostItems: LostItemRepository
	let useCase: MarkListingThreadReadUseCase

	beforeEach(() => {
		repository = buildRepository()
		lostItems = buildLostItemRepository()
		vi.mocked(lostItems.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)
		useCase = new MarkListingThreadReadUseCase(repository, lostItems)
	})

	it.each([DESK, POSTER])('marks the thread in the scope %j', async scope => {
		await useCase.execute({ lostItemId: 'lost-item-1', scope })

		expect(repository.markThreadRead).toHaveBeenCalledWith('lost-item-1', scope)
	})

	it('refuses a poster the thread of a listing they do not own', async () => {
		await expect(
			useCase.execute({
				lostItemId: 'lost-item-1',
				scope: { side: 'owner', userId: 'user-2' },
			}),
		).rejects.toThrow(LostItemForbiddenError)
		expect(repository.markThreadRead).not.toHaveBeenCalled()
	})
})
