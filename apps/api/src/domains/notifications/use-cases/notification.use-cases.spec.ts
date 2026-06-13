import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificationNotFoundError } from '../errors/notification.errors'
import type { Notification } from '../models/notification.model'
import type { NotificationRepository } from '../repository/notification.repository'
import { NotificationUseCases } from './notification.use-cases'

function buildNotification(overrides: Partial<Notification> = {}): Notification {
	return {
		id: 'notification-1',
		type: 'match_found',
		title: 'Correspondance trouvée',
		message: 'Un objet correspondant à votre annonce a été trouvé',
		link: '/posts/lost-item-1',
		read: false,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		readAt: null,
		...overrides,
	}
}

function buildRepository(): NotificationRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		countUnread: vi.fn(),
	}
}

describe('NotificationUseCases', () => {
	let repository: NotificationRepository
	let useCases: NotificationUseCases

	beforeEach(() => {
		repository = buildRepository()
		useCases = new NotificationUseCases(repository)
	})

	describe('create', () => {
		it('delegates to the repository', async () => {
			const notification = buildNotification()
			vi.mocked(repository.create).mockResolvedValue(notification)

			const data = {
				type: 'match_found' as const,
				title: notification.title,
				message: notification.message,
				link: notification.link ?? undefined,
				userId: notification.userId,
			}
			const result = await useCases.create(data)

			expect(repository.create).toHaveBeenCalledWith(data)
			expect(result).toEqual(notification)
		})
	})

	describe('listMine', () => {
		it('delegates to the repository with the user id injected', async () => {
			const response = {
				items: [buildNotification()],
				total: 1,
				page: 1,
				pageSize: 20,
			}
			vi.mocked(repository.list).mockResolvedValue(response)

			const filter = { page: 1, pageSize: 20 }
			const result = await useCases.listMine('user-1', filter)

			expect(repository.list).toHaveBeenCalledWith({
				...filter,
				userId: 'user-1',
			})
			expect(result).toEqual(response)
		})
	})

	describe('markAsRead', () => {
		it('marks the notification as read when owned by the user', async () => {
			const notification = buildNotification()
			const read = buildNotification({ read: true, readAt: new Date('2026-01-02') })
			vi.mocked(repository.findById).mockResolvedValue(notification)
			vi.mocked(repository.markAsRead).mockResolvedValue(read)

			const result = await useCases.markAsRead('notification-1', 'user-1')

			expect(repository.markAsRead).toHaveBeenCalledWith('notification-1')
			expect(result).toEqual(read)
		})

		it('throws NotificationNotFoundError when the notification does not exist', async () => {
			vi.mocked(repository.findById).mockResolvedValue(null)

			await expect(
				useCases.markAsRead('missing', 'user-1'),
			).rejects.toThrow(NotificationNotFoundError)
			expect(repository.markAsRead).not.toHaveBeenCalled()
		})

		it('throws NotificationNotFoundError when the notification belongs to another user', async () => {
			const notification = buildNotification({ userId: 'user-2' })
			vi.mocked(repository.findById).mockResolvedValue(notification)

			await expect(
				useCases.markAsRead('notification-1', 'user-1'),
			).rejects.toThrow(NotificationNotFoundError)
			expect(repository.markAsRead).not.toHaveBeenCalled()
		})
	})

	describe('markAllAsRead', () => {
		it('delegates to the repository', async () => {
			await useCases.markAllAsRead('user-1')

			expect(repository.markAllAsRead).toHaveBeenCalledWith('user-1')
		})
	})

	describe('getUnreadCount', () => {
		it('delegates to the repository', async () => {
			vi.mocked(repository.countUnread).mockResolvedValue(3)

			const result = await useCases.getUnreadCount('user-1')

			expect(repository.countUnread).toHaveBeenCalledWith('user-1')
			expect(result).toBe(3)
		})
	})
})
