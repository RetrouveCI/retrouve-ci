import { describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import { requirePublishedLostItem } from '../require-published-lost-item'

describe('requirePublishedLostItem', () => {
	it('returns the lost item when it is published', async () => {
		const repository = buildRepository()
		const lostItem = buildLostItem({ moderationStatus: 'published' })
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		expect(await requirePublishedLostItem(repository, 'lost-item-1')).toEqual(
			lostItem,
		)
	})

	it('throws when the item does not exist', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			requirePublishedLostItem(repository, 'missing'),
		).rejects.toThrow(LostItemNotFoundError)
	})

	/** Not forbidden: an id under moderation must not be confirmed to exist. */
	it.each(['pending', 'hidden'] as const)(
		'answers not found for a %s item',
		async moderationStatus => {
			const repository = buildRepository()
			vi.mocked(repository.findById).mockResolvedValue(
				buildLostItem({ moderationStatus }),
			)

			await expect(
				requirePublishedLostItem(repository, 'lost-item-1'),
			).rejects.toThrow(LostItemNotFoundError)
		},
	)
})
