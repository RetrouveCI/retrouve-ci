import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { GetLostItemForDeskUseCase } from '../get-lost-item-for-desk.use-case'

describe('GetLostItemForDeskUseCase', () => {
	let repository: LostItemRepository
	let useCase: GetLostItemForDeskUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new GetLostItemForDeskUseCase(repository)
	})

	// The route is admin-only, and that is the whole scope: the desk moderates
	// what nobody else may read.
	it.each(['pending', 'published', 'hidden'] as const)(
		'returns a %s listing whoever posted it',
		async moderationStatus => {
			const lostItem = buildLostItem({ moderationStatus, userId: 'user-9' })
			vi.mocked(repository.findById).mockResolvedValue(lostItem)

			await expect(useCase.execute('lost-item-1')).resolves.toEqual(lostItem)
			expect(repository.findById).toHaveBeenCalledWith('lost-item-1')
		},
	)

	// What the moderator needs to decide, and what a public read never carries.
	it('keeps what the desk moderates on', async () => {
		const lostItem = buildLostItem({
			documentNumber: 'CI0012345678',
			moderationReasonNote: 'Numéro lisible sur la deuxième photo',
			postedFor: 'KOUASSI Jean',
		})
		vi.mocked(repository.findById).mockResolvedValue(lostItem)

		const result = await useCase.execute('lost-item-1')

		expect(result.documentNumber).toBe('CI0012345678')
		expect(result.moderationReasonNote).toBe(
			'Numéro lisible sur la deuxième photo',
		)
		expect(result.postedFor).toBe('KOUASSI Jean')
	})

	// A moderator opening a listing is not an audience figure.
	it('counts no view', async () => {
		vi.mocked(repository.findById).mockResolvedValue(buildLostItem())

		await useCase.execute('lost-item-1')

		expect(repository.incrementViews).not.toHaveBeenCalled()
	})

	it('answers not found for a listing that does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
	})
})
