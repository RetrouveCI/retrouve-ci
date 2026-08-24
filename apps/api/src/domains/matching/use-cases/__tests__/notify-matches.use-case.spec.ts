import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	buildLostItem,
	buildRepository,
} from '@/domains/lost-items/__tests__/lost-item.fixture'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { CreateNotificationUseCase } from '@/domains/notifications/use-cases/create-notification.use-case'
import { NotifyMatchesUseCase } from '../notify-matches.use-case'

function buildCreateNotification(): CreateNotificationUseCase {
	return { execute: vi.fn() } as unknown as CreateNotificationUseCase
}

const foundMatch = (userId: string, id = 'lost-item-2') =>
	buildLostItem({
		id,
		type: 'found',
		title: 'iPhone retrouvé',
		description: 'Trouvé près du marché de Cocody',
		eventDate: new Date('2026-01-02'),
		userId,
	})

describe('NotifyMatchesUseCase', () => {
	let repository: LostItemRepository
	let createNotification: CreateNotificationUseCase
	let useCase: NotifyMatchesUseCase

	beforeEach(() => {
		repository = buildRepository()
		createNotification = buildCreateNotification()
		useCase = new NotifyMatchesUseCase(repository, createNotification)
	})

	it('notifies the source owner once per relevant match', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ type: 'lost', userId: 'user-1' }),
		)
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([
			foundMatch('user-2'),
		])

		await useCase.execute('lost-item-1')

		expect(createNotification.execute).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'match_found',
				userId: 'user-1',
				link: '/posts/lost-item-2',
			}),
		)
	})

	/** Being told your own two listings match each other is noise, not news. */
	it('skips matches the source owner already owns', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ type: 'lost', userId: 'user-1' }),
		)
		vi.mocked(repository.findMatchCandidates).mockResolvedValue([
			foundMatch('user-1'),
		])

		await useCase.execute('lost-item-1')

		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	/**
	 * Unlike `FindMatchesUseCase`, this one returns quietly: the job is enqueued
	 * at publication, before moderation has necessarily passed.
	 */
	it('does nothing while the source is not published', async () => {
		vi.mocked(repository.findById).mockResolvedValue(
			buildLostItem({ moderationStatus: 'pending' }),
		)

		await expect(useCase.execute('lost-item-1')).resolves.toBeUndefined()

		expect(repository.findMatchCandidates).not.toHaveBeenCalled()
		expect(createNotification.execute).not.toHaveBeenCalled()
	})

	it('throws when the source does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCase.execute('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(createNotification.execute).not.toHaveBeenCalled()
	})
})
