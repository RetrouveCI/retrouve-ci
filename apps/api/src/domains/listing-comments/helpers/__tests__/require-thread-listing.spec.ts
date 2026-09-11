import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
} from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import { DESK, POSTER } from '../../__tests__/listing-comment.fixture'
import { requireThreadListing } from '../require-thread-listing'

describe('requireThreadListing', () => {
	let repository: LostItemRepository

	beforeEach(() => {
		repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-2' }),
		)
	})

	it('opens any listing to the desk', async () => {
		await expect(
			requireThreadListing(repository, 'lost-item-1', DESK),
		).resolves.toMatchObject({ userId: 'user-2' })
	})

	it('opens a listing to the poster who owns it', async () => {
		await expect(
			requireThreadListing(repository, 'lost-item-1', {
				side: 'owner',
				userId: 'user-2',
			}),
		).resolves.toMatchObject({ userId: 'user-2' })
	})

	it('refuses a poster the listing of someone else', async () => {
		await expect(
			requireThreadListing(repository, 'lost-item-1', POSTER),
		).rejects.toThrow(LostItemForbiddenError)
	})

	it.each([DESK, POSTER])(
		'answers not found for a missing listing',
		async scope => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(
				requireThreadListing(repository, 'missing', scope),
			).rejects.toThrow(LostItemNotFoundError)
		},
	)
})
