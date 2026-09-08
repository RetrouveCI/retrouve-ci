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
	 * The user id comes from the session and the audience from the guard, never
	 * from the request, so these assertions are the scoping guarantee as much as
	 * a delegation check.
	 */
	const VISITOR = { audience: 'user', userId: 'user-1' } as const
	const DESK = { audience: 'admin' } as const

	describe('listMine', () => {
		it.each([
			['public', VISITOR],
			['admin', DESK],
		] as const)('scopes a %s listing to %j', async (audience, scope) => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(getMyNotifications.execute).mockResolvedValue(response as never)

			const result = await controller.listMine(session, audience, {
				page: 1,
				pageSize: 20,
			})

			expect(getMyNotifications.execute).toHaveBeenCalledWith({
				scope,
				filter: { page: 1, pageSize: 20 },
			})
			expect(result).toEqual(response)
		})
	})

	describe('getUnreadCount', () => {
		it('answers a bare number for the session user', async () => {
			vi.mocked(getUnreadCount.execute).mockResolvedValue(3)

			expect(await controller.getUnreadCount(session, 'public')).toBe(3)
			expect(getUnreadCount.execute).toHaveBeenCalledWith(VISITOR)
		})

		// The desk's badge must not fold in the administrator's own notifications.
		it("counts the desk's, not the administrator's own", async () => {
			vi.mocked(getUnreadCount.execute).mockResolvedValue(1)

			await controller.getUnreadCount(session, 'admin')

			expect(getUnreadCount.execute).toHaveBeenCalledWith(DESK)
		})
	})

	describe('markAllAsRead', () => {
		it.each([
			['public', VISITOR],
			['admin', DESK],
		] as const)('marks only what %s can see', async (audience, scope) => {
			await controller.markAllAsRead(session, audience)

			expect(markAllAsRead.execute).toHaveBeenCalledWith(scope)
		})
	})

	describe('markAsRead', () => {
		it('passes the id and the resolved scope together', async () => {
			const notification = { id: 'notification-1', read: true }
			vi.mocked(markAsRead.execute).mockResolvedValue(notification as never)

			const result = await controller.markAsRead(
				session,
				'public',
				'notification-1',
			)

			expect(markAsRead.execute).toHaveBeenCalledWith({
				id: 'notification-1',
				scope: VISITOR,
			})
			expect(result).toEqual(notification)
		})
	})
})
