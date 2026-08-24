import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { GetMyNotificationsUseCase } from '@/domains/notifications/use-cases/get-my-notifications.use-case'
import type { GetUnreadNotificationsCountUseCase } from '@/domains/notifications/use-cases/get-unread-notifications-count.use-case'
import type { MarkAllNotificationsAsReadUseCase } from '@/domains/notifications/use-cases/mark-all-notifications-as-read.use-case'
import type { MarkNotificationAsReadUseCase } from '@/domains/notifications/use-cases/mark-notification-as-read.use-case'
import { NotificationsController } from '../notifications.controller'

function buildUseCase<T>(): T {
	return { execute: vi.fn() } as unknown as T
}

const session = { user: { id: 'user-1' } } as Parameters<
	NotificationsController['listMine']
>[0]

describe('NotificationsController', () => {
	let getMyNotifications: GetMyNotificationsUseCase
	let getUnreadCount: GetUnreadNotificationsCountUseCase
	let markAllAsRead: MarkAllNotificationsAsReadUseCase
	let markAsRead: MarkNotificationAsReadUseCase
	let controller: NotificationsController

	beforeEach(() => {
		getMyNotifications = buildUseCase<GetMyNotificationsUseCase>()
		getUnreadCount = buildUseCase<GetUnreadNotificationsCountUseCase>()
		markAllAsRead = buildUseCase<MarkAllNotificationsAsReadUseCase>()
		markAsRead = buildUseCase<MarkNotificationAsReadUseCase>()
		controller = new NotificationsController(
			getMyNotifications,
			getUnreadCount,
			markAllAsRead,
			markAsRead,
		)
	})

	/**
	 * Every route reads the user id from the session, never from the request, so
	 * these assertions are the scoping guarantee as much as a delegation check.
	 */
	describe('listMine', () => {
		it('scopes the listing to the session user', async () => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(getMyNotifications.execute).mockResolvedValue(response as never)

			const result = await controller.listMine(session, {
				page: 1,
				pageSize: 20,
			})

			expect(getMyNotifications.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				filter: { page: 1, pageSize: 20 },
			})
			expect(result).toEqual(response)
		})
	})

	describe('getUnreadCount', () => {
		it('answers a bare number for the session user', async () => {
			vi.mocked(getUnreadCount.execute).mockResolvedValue(3)

			expect(await controller.getUnreadCount(session)).toBe(3)
			expect(getUnreadCount.execute).toHaveBeenCalledWith('user-1')
		})
	})

	describe('markAllAsRead', () => {
		it("marks only the session user's notifications", async () => {
			await controller.markAllAsRead(session)

			expect(markAllAsRead.execute).toHaveBeenCalledWith('user-1')
		})
	})

	describe('markAsRead', () => {
		it('passes the id and the session user together', async () => {
			const notification = { id: 'notification-1', read: true }
			vi.mocked(markAsRead.execute).mockResolvedValue(notification as never)

			const result = await controller.markAsRead(session, 'notification-1')

			expect(markAsRead.execute).toHaveBeenCalledWith({
				id: 'notification-1',
				userId: 'user-1',
			})
			expect(result).toEqual(notification)
		})
	})
})
