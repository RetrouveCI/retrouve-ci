import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetLostItemByIdUseCase } from '../get-lost-item-by-id.use-case'

describe('GetLostItemByIdUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetLostItemByIdUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetLostItemByIdUseCase(repository)
	})

	it('returns the lost item when it exists', async () => {
		const lostItem = buildLostItem()
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		expect(await useCase.execute('lost-item-1')).toEqual(lostItem)
	})

	it('throws when it does not', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
	})

	/**
	 * Current behaviour, asserted rather than implied: this use-case applies no
	 * moderation check, and `GET /lost-items/:id` is `@AllowAnonymous()`. So an
	 * unpublished listing is readable by id. `ViewLostItemUseCase` is the one
	 * that narrows to published — and nothing calls it.
	 */
	it('returns an unpublished item too', async () => {
		const pending = buildLostItem({ moderationStatus: 'pending' })
		vi.mocked(repository.findById).mockResolvedValue(pending)

		expect(await useCase.execute('lost-item-1')).toEqual(pending)
	})
})
