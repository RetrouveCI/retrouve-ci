import { describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import { requireLostItem } from '../require-lost-item'

describe('requireLostItem', () => {
	it('returns the lost item when it exists', async () => {
		const repository = buildRepository()
		const lostItem = buildLostItem()
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		expect(await requireLostItem(repository, 'lost-item-1')).toEqual(lostItem)
	})

	it('throws when it does not', async () => {
		const repository = buildRepository()
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(requireLostItem(repository, 'missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
	})

	it('does not narrow by moderation status', async () => {
		const repository = buildRepository()
		const pending = buildLostItem({ moderationStatus: 'pending' })
		vi.mocked(repository.findById).mockResolvedValue(pending)

		expect(await requireLostItem(repository, 'lost-item-1')).toEqual(pending)
	})
})
