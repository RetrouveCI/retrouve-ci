import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '../../__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '../../errors/lost-item.errors'
import type { LostItemRepository } from '../../repository/lost-item.repository'
import { ModerateLostItemUseCase } from '../moderate-lost-item.use-case'

describe('ModerateLostItemUseCase', () => {
	let repository: LostItemRepository
	let useCase: ModerateLostItemUseCase

	beforeEach(() => {
		repository = buildRepository()
		useCase = new ModerateLostItemUseCase(repository)
	})

	it('updates the moderation status', async () => {
		const moderated = buildLostItem({ moderationStatus: 'published' })
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ moderationStatus: 'pending' }),
		)
		vi.mocked(repository.updateModerationStatus).mockResolvedValue(moderated)

		const result = await useCase.execute({
			id: 'lost-item-1',
			moderationStatus: 'published',
		})

		expect(repository.updateModerationStatus).toHaveBeenCalledWith(
			'lost-item-1',
			{ moderationStatus: 'published' },
		)
		expect(result).toEqual(moderated)
	})

	// The id is the route's, so it must not reach the write as a field.
	it('carries the reason and its note through to the write', async () => {
		vi.mocked(repository.findById).mockResolvedValue(buildLostItem())
		vi.mocked(repository.updateModerationStatus).mockResolvedValue(
			buildLostItem({ moderationStatus: 'hidden' }),
		)

		await useCase.execute({
			id: 'lost-item-1',
			moderationStatus: 'hidden',
			moderationReason: 'other',
			moderationReasonNote: 'La 2e photo montre une carte bancaire.',
		})

		expect(repository.updateModerationStatus).toHaveBeenCalledWith(
			'lost-item-1',
			{
				moderationStatus: 'hidden',
				moderationReason: 'other',
				moderationReasonNote: 'La 2e photo montre une carte bancaire.',
			},
		)
	})

	it('throws when the item does not exist, without writing', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(
			useCase.execute({ id: 'missing', moderationStatus: 'published' }),
		).rejects.toThrow(LostItemNotFoundError)
		expect(repository.updateModerationStatus).not.toHaveBeenCalled()
	})

	/** Moderation is an admin action: it deliberately checks no ownership. */
	it('moderates an item owned by somebody else', async () => {
		const moderated = buildLostItem({
			userId: 'user-9',
			moderationStatus: 'hidden',
		})
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ userId: 'user-9' }),
		)
		vi.mocked(repository.updateModerationStatus).mockResolvedValue(moderated)

		expect(
			await useCase.execute({
				id: 'lost-item-1',
				moderationStatus: 'hidden',
			}),
		).toEqual(moderated)
	})
})
