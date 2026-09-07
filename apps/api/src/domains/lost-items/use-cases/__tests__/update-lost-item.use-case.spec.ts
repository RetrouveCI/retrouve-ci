import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import {
	LostItemForbiddenError,
	LostItemNotFoundError,
	LostItemPhotosRefusedError,
} from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { UpdateLostItemUseCase } from '../update-lost-item.use-case'

describe('UpdateLostItemUseCase', () => {
	let repository: LostItemRepository
	let useCase: UpdateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateLostItemUseCase(repository)
	})

	it('updates the lost item when the caller owns it', async () => {
		const updated = buildLostItem({ userId: 'user-1', title: 'Nouveau titre' })
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)
		vi.mocked(repository.update).mockResolvedValue(updated)

		const result = await useCase.execute({
			id: 'lost-item-1',
			userId: 'user-1',
			data: { title: 'Nouveau titre' },
		})

		expect(repository.update).toHaveBeenCalledWith('lost-item-1', {
			title: 'Nouveau titre',
		})
		expect(result).toEqual(updated)
	})

	it("refuses somebody else's item without writing", async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1' }),
		)

		await expect(
			useCase.execute({
				id: 'lost-item-1',
				userId: 'user-2',
				data: { title: 'Nouveau titre' },
			}),
		).rejects.toThrow(LostItemForbiddenError)
		expect(repository.update).not.toHaveBeenCalled()
	})

	it('throws when the item does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({
				id: 'missing',
				userId: 'user-1',
				data: { title: 'Nouveau titre' },
			}),
		).rejects.toThrow(LostItemNotFoundError)
		expect(repository.update).not.toHaveBeenCalled()
	})
})

/** R43: the category is not patchable, so the stored row is the only witness. */
describe('UpdateLostItemUseCase — photos on a document listing', () => {
	let repository: LostItemRepository
	let useCase: UpdateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new UpdateLostItemUseCase(repository)
	})

	const edit = (
		category: 'documents' | 'wallet',
		photos: string[] | undefined,
	) => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-1', category }),
		)
		vi.mocked(repository.update).mockResolvedValue(buildLostItem())

		return useCase.execute({
			id: 'lost-item-1',
			userId: 'user-1',
			data: { photos },
		})
	}

	it('refuses a photo added to a stored document listing', async () => {
		await expect(edit('documents', ['https://cdn/cni.jpg'])).rejects.toThrow(
			LostItemPhotosRefusedError,
		)
		expect(repository.update).not.toHaveBeenCalled()
	})

	// What the edit screen actually sends: it says how many will be removed.
	it.each([[[]], [undefined]])(
		'lets %o through, carrying nothing',
		async photos => {
			await edit('documents', photos)

			expect(repository.update).toHaveBeenCalled()
		},
	)

	it('leaves a photo on any other category alone', async () => {
		await edit('wallet', ['https://cdn/wallet.jpg'])

		expect(repository.update).toHaveBeenCalled()
	})
})
