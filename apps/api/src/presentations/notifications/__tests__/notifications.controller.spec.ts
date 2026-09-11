import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	PUSH_AUTH_LENGTH,
	PUSH_P256DH_LENGTH,
} from '@app/contracts/notifications'
import type { GetMyNotificationsUseCase } from '@/domains/notifications/use-cases/get-my-notifications.use-case'
import type { GetUnreadNotificationsCountUseCase } from '@/domains/notifications/use-cases/get-unread-notifications-count.use-case'
import type { MarkAllNotificationsAsReadUseCase } from '@/domains/notifications/use-cases/mark-all-notifications-as-read.use-case'
import type { MarkNotificationAsReadUseCase } from '@/domains/notifications/use-cases/mark-notification-as-read.use-case'
import type { SubscribeToPushUseCase } from '@/domains/notifications/use-cases/subscribe-to-push.use-case'
import type { UnsubscribeFromPushUseCase } from '@/domains/notifications/use-cases/unsubscribe-from-push.use-case'
import { DeskNotificationsForbiddenError } from '@/domains/notifications/errors/notification.errors'
import { NotificationsController } from '../notifications.controller'

function buildUseCase<T>(): T {
	return { execute: vi.fn() } as unknown as T
}

type Caller = Parameters<NotificationsController['listMine']>[0]

const session = { user: { id: 'user-1' } } as Caller
const administrator = { user: { id: 'admin-1', role: 'admin' } } as Caller

describe('NotificationsController', () => {
	let getMyNotifications: GetMyNotificationsUseCase
	let getUnreadCount: GetUnreadNotificationsCountUseCase
	let markAllAsRead: MarkAllNotificationsAsReadUseCase
	let markAsRead: MarkNotificationAsReadUseCase
	let subscribeToPush: SubscribeToPushUseCase
	let unsubscribeFromPush: UnsubscribeFromPushUseCase
	let controller: NotificationsController

	beforeEach(() => {
		getMyNotifications = buildUseCase<GetMyNotificationsUseCase>()
		getUnreadCount = buildUseCase<GetUnreadNotificationsCountUseCase>()
		markAllAsRead = buildUseCase<MarkAllNotificationsAsReadUseCase>()
		markAsRead = buildUseCase<MarkNotificationAsReadUseCase>()
		subscribeToPush = buildUseCase<SubscribeToPushUseCase>()
		unsubscribeFromPush = buildUseCase<UnsubscribeFromPushUseCase>()
		controller = new NotificationsController(
			getMyNotifications,
			getUnreadCount,
			markAllAsRead,
			markAsRead,
			subscribeToPush,
			unsubscribeFromPush,
		)
	})

	describe('push', () => {
		const SUBSCRIPTION = {
			endpoint: 'https://fcm.googleapis.com/fcm/send/abc',
			keys: {
				p256dh: 'a'.repeat(PUSH_P256DH_LENGTH),
				auth: 'b'.repeat(PUSH_AUTH_LENGTH),
			},
		}

		// The owner comes from the session, so a body naming someone else stores
		// the row under the caller regardless.
		it('flattens the browser payload under the session owner', async () => {
			await controller.subscribe(session, SUBSCRIPTION)

			expect(subscribeToPush.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				endpoint: SUBSCRIPTION.endpoint,
				p256dh: SUBSCRIPTION.keys.p256dh,
				auth: SUBSCRIPTION.keys.auth,
			})
		})

		it('scopes an unsubscribe to the caller', async () => {
			await controller.unsubscribe(session, { endpoint: SUBSCRIPTION.endpoint })

			expect(unsubscribeFromPush.execute).toHaveBeenCalledWith({
				userId: 'user-1',
				endpoint: SUBSCRIPTION.endpoint,
			})
		})
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
			['public', session, VISITOR],
			['admin', administrator, DESK],
		] as const)('scopes a %s listing', async (audience, caller, scope) => {
			const response = { items: [], total: 0, page: 1, pageSize: 20 }
			vi.mocked(getMyNotifications.execute).mockResolvedValue(response as never)

			const result = await controller.listMine(caller, audience, {
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

			await controller.getUnreadCount(administrator, 'admin')

			expect(getUnreadCount.execute).toHaveBeenCalledWith(DESK)
		})
	})

	describe('markAllAsRead', () => {
		it.each([
			['public', session, VISITOR],
			['admin', administrator, DESK],
		] as const)(
			'marks only what %s can see',
			async (audience, caller, scope) => {
				await controller.markAllAsRead(caller, audience)

				expect(markAllAsRead.execute).toHaveBeenCalledWith(scope)
			},
		)
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

	// Every visitor holds a password account and can sign in to the backoffice's
	// instance with it: the audience alone must not open the desk's queue.
	describe('a backoffice session without the role', () => {
		it('reads nothing of the desk', () => {
			expect(() =>
				controller.listMine(session, 'admin', { page: 1, pageSize: 20 }),
			).toThrow(DeskNotificationsForbiddenError)
			expect(getMyNotifications.execute).not.toHaveBeenCalled()
		})

		it('marks nothing of the desk read', () => {
			expect(() => controller.markAllAsRead(session, 'admin')).toThrow(
				DeskNotificationsForbiddenError,
			)
			expect(markAllAsRead.execute).not.toHaveBeenCalled()
		})
	})
})
