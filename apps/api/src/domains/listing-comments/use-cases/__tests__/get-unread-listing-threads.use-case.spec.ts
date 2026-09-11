import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildRepository,
	DESK,
	POSTER,
} from '../../__tests__/listing-comment.fixture'
import type { ListingCommentRepository } from '../../repository/listing-comment.repository'
import { GetUnreadListingThreadsUseCase } from '../get-unread-listing-threads.use-case'

describe('GetUnreadListingThreadsUseCase', () => {
	let repository: ListingCommentRepository
	let useCase: GetUnreadListingThreadsUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetUnreadListingThreadsUseCase(repository)
	})

	it.each([DESK, POSTER])('reads in the scope %j', async scope => {
		const unread = [{ lostItemId: 'lost-item-1', unread: 2 }]
		vi.mocked(repository.listUnreadThreads).mockResolvedValue(unread)

		await expect(useCase.execute(scope)).resolves.toEqual(unread)
		expect(repository.listUnreadThreads).toHaveBeenCalledWith(scope)
	})
})
