import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { NotificationsController } from './notifications.controller'

function buildUseCases(): NotificationUseCases {
	return {
		create: vi.fn(),
		listMine: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		getUnreadCount: vi.fn(),
	} as unknown as NotificationUseCases
}

const session = { user: { id: 'user-1' } } as Parameters<
	NotificationsController['listMine']
>[0]

describe('NotificationsController', () => {
	let useCases: NotificationUseCases
	let controller: NotificationsController

	beforeEach(() => {
		useCases = buildUseCases()
		controller = new NotificationsController(useCases)
	})

	describe('listMine', () => {
		it('delegates to listMine with the session user id', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(useCases.listMine).mockResolvedValue(response as never)

			const result = await controller.listMine(session, {
				page: 1,
				pageSize: 20,
			})

			expect(useCases.listMine).toHaveBeenCalledWith('user-1', {
				page: 1,
				pageSize: 20,
			})
			expect(result).toEqual(response)
		})
	})

	describe('getUnreadCount', () => {
		it('delegates to getUnreadCount with the session user id', async () => {
			vi.mocked(useCases.getUnreadCount).mockResolvedValue(3)

			const result = await controller.getUnreadCount(session)

			expect(useCases.getUnreadCount).toHaveBeenCalledWith('user-1')
			expect(result).toBe(3)
		})
	})

	describe('markAllAsRead', () => {
		it('delegates to markAllAsRead with the session user id', async () => {
			await controller.markAllAsRead(session)

			expect(useCases.markAllAsRead).toHaveBeenCalledWith('user-1')
		})
	})

	describe('markAsRead', () => {
		it('delegates to markAsRead with the session user id', async () => {
			const notification = { id: 'notification-1', read: true }
			vi.mocked(useCases.markAsRead).mockResolvedValue(notification as never)

			const result = await controller.markAsRead(session, 'notification-1')

			expect(useCases.markAsRead).toHaveBeenCalledWith(
				'notification-1',
				'user-1',
			)
			expect(result).toEqual(notification)
		})
	})
})
