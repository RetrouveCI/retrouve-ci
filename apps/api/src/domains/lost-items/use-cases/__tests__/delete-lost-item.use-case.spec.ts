import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
} from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { DeleteLostItemUseCase } from '../delete-lost-item.use-case'

describe('DeleteLostItemUseCase', () => {
	let repository: LostItemRepository
	let useCase: DeleteLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new DeleteLostItemUseCase(repository)
	})

	it('deletes the lost item when the caller owns it', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)

		await useCase.execute({ id: 'lost-item-1', userId: 'user-1' })

		expect(repository.delete).toHaveBeenCalledWith('lost-item-1')
	})

	it("refuses somebody else's item without deleting", async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)

		await expect(
			useCase.execute({ id: 'lost-item-1', userId: 'user-2' }),
		).rejects.toThrow(LostItemForbiddenError)
		expect(repository.delete).not.toHaveBeenCalled()
	})

	it('throws when the item does not exist, without deleting', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', userId: 'user-1' }),
		).rejects.toThrow(LostItemNotFoundError)
		expect(repository.delete).not.toHaveBeenCalled()
	})
})
