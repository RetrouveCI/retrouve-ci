import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LostItemNotFoundError } from '@/domains/lost-items/errors/lost-item.errors'
import type { LostItem } from '@/domains/lost-items/models/lost-item.model'
import type { LostItemRepository } from '@/domains/lost-items/repository/lost-item.repository'
import type { NotificationRepository } from '@/domains/notifications/repository/notification.repository'
import { MATCH_SCORE_THRESHOLD } from '../constants'
import { MatchingUseCases } from './matching.use-cases'

function buildLostItem(overrides: Partial<LostItem> = {}): LostItem {
	return {
		id: 'lost-item-1',
		type: 'lost',
		category: 'phone',
		title: 'iPhone 13 perdu',
		description: 'Perdu près du marché de Cocody, coque noire avec autocollant',
		ville: 'Abidjan',
		commune: 'Cocody',
		eventDate: new Date('2026-01-01'),
		contactName: 'Jean Dupont',
		contactWhatsapp: '+2250700000000',
		photos: [],
		moderationStatus: 'published',
		resolutionStatus: 'active',
		views: 0,
		contactsCount: 0,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		updatedAt: new Date('2026-01-01'),
		...overrides,
	}
}

function buildRepository(): LostItemRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		update: vi.fn(),
		updateModerationStatus: vi.fn(),
		delete: vi.fn(),
		incrementViews: vi.fn(),
		incrementContacts: vi.fn(),
	}
}

function buildNotificationRepository(): NotificationRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		countUnread: vi.fn(),
	}
}

describe('MatchingUseCases', () => {
	let repository: LostItemRepository
	let notificationRepository: NotificationRepository
	let useCases: MatchingUseCases

	beforeEach(() => {
		repository = buildRepository()
		notificationRepository = buildNotificationRepository()
		useCases = new MatchingUseCases(repository, notificationRepository)
	})

	it('throws LostItemNotFoundError when the source item does not exist', async () => {
		vi.mocked(repository.findById).mockResolvedValue(null)

		await expect(useCases.findMatches('missing')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.list).not.toHaveBeenCalled()
	})

	it('searches the opposite type and returns matches above the threshold', async () => {
		const source = buildLostItem({ type: 'lost' })
		const strongMatch = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			title: 'iPhone retrouvé',
			description: 'Trouvé près du marché de Cocody',
			eventDate: new Date('2026-01-02'),
		})
		const weakMatch = buildLostItem({
			id: 'lost-item-3',
			type: 'found',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Clés trouvées',
			description: 'Sans rapport',
			eventDate: new Date('2026-06-01'),
		})

		vi.mocked(repository.findById).mockResolvedValue(source)
		vi.mocked(repository.list).mockResolvedValue({
			items: [strongMatch, weakMatch],
			total: 2,
			page: 1,
			pageSize: 100,
		})

		const result = await useCases.findMatches('lost-item-1')

		expect(repository.list).toHaveBeenCalledWith(
			expect.objectContaining({
				type: 'found',
				moderationStatus: 'published',
				resolutionStatus: 'active',
			}),
		)
		expect(result).toHaveLength(1)
		expect(result[0]?.lostItem).toEqual(strongMatch)
		expect(result[0]?.score).toBeGreaterThanOrEqual(MATCH_SCORE_THRESHOLD)
	})

	it('returns an empty array when no candidate matches above the threshold', async () => {
		const source = buildLostItem({ type: 'lost' })
		const noMatch = buildLostItem({
			id: 'lost-item-2',
			type: 'found',
			category: 'keys',
			ville: 'Bouaké',
			commune: 'Houphouet',
			title: 'Clés trouvées',
			description: 'Sans rapport',
			eventDate: new Date('2026-06-01'),
		})

		vi.mocked(repository.findById).mockResolvedValue(source)
		vi.mocked(repository.list).mockResolvedValue({
			items: [noMatch],
			total: 1,
			page: 1,
			pageSize: 100,
		})

		const result = await useCases.findMatches('lost-item-1')

		expect(result).toEqual([])
	})

	it('throws LostItemNotFoundError when the source item is not published', async () => {
		const source = buildLostItem({ moderationStatus: 'pending' })
		vi.mocked(repository.findById).mockResolvedValue(source)

		await expect(useCases.findMatches('lost-item-1')).rejects.toThrow(
			LostItemNotFoundError,
		)
		expect(repository.list).not.toHaveBeenCalled()
	})

	describe('notifyMatches', () => {
		it('creates a notification for the source owner for each relevant match', async () => {
			const source = buildLostItem({ type: 'lost', userId: 'user-1' })
			const strongMatch = buildLostItem({
				id: 'lost-item-2',
				type: 'found',
				title: 'iPhone retrouvé',
				description: 'Trouvé près du marché de Cocody',
				eventDate: new Date('2026-01-02'),
				userId: 'user-2',
			})

			vi.mocked(repository.findById).mockResolvedValue(source)
			vi.mocked(repository.list).mockResolvedValue({
				items: [strongMatch],
				total: 1,
				page: 1,
				pageSize: 100,
			})

			await useCases.notifyMatches('lost-item-1')

			expect(notificationRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					type: 'match_found',
					userId: 'user-1',
					link: '/posts/lost-item-2',
				}),
			)
		})

		it('does not notify about matches owned by the same user', async () => {
			const source = buildLostItem({ type: 'lost', userId: 'user-1' })
			const ownMatch = buildLostItem({
				id: 'lost-item-2',
				type: 'found',
				title: 'iPhone retrouvé',
				description: 'Trouvé près du marché de Cocody',
				eventDate: new Date('2026-01-02'),
				userId: 'user-1',
			})

			vi.mocked(repository.findById).mockResolvedValue(source)
			vi.mocked(repository.list).mockResolvedValue({
				items: [ownMatch],
				total: 1,
				page: 1,
				pageSize: 100,
			})

			await useCases.notifyMatches('lost-item-1')

			expect(notificationRepository.create).not.toHaveBeenCalled()
		})

		it('does not notify while the source item is not published', async () => {
			const source = buildLostItem({ moderationStatus: 'pending' })
			vi.mocked(repository.findById).mockResolvedValue(source)

			await useCases.notifyMatches('lost-item-1')

			expect(repository.list).not.toHaveBeenCalled()
			expect(notificationRepository.create).not.toHaveBeenCalled()
		})

		it('throws LostItemNotFoundError when the source item does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(useCases.notifyMatches('missing')).rejects.toThrow(
				LostItemNotFoundError,
			)
			expect(notificationRepository.create).not.toHaveBeenCalled()
		})
	})
})
