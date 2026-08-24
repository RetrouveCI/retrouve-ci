import { describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
} from '../../errors/lost-item.errors'
import { requireOwnedLostItem } from '../require-owned-lost-item'

describe('requireOwnedLostItem', () => {
	it('returns the lost item when the caller owns it', async () => {
		const repository = buildRepository()
		const lostItem = buildLostItem({ userId: 'user-1' })
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		expect(
			await requireOwnedLostItem(repository, 'lost-item-1', 'user-1'),
		).toEqual(lostItem)
	})

	it('throws forbidden when somebody else owns it', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)

		await expect(
			requireOwnedLostItem(repository, 'lost-item-1', 'user-2'),
		).rejects.toThrow(LostItemForbiddenError)
	})

	it('throws not found when the item does not exist', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			requireOwnedLostItem(repository, 'missing', 'user-1'),
		).rejects.toThrow(LostItemNotFoundError)
	})
})
