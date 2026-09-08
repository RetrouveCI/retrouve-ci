import { vi } from 'vitest'
import type { NotificationRepository } from '../repository/notification.repository'
import type { Notification } from '../types/notification.types'

export function buildNotification(
	overrides: Partial<Notification> = {},
): Notification {
	return {
		id: 'notification-1',
		type: 'match_found',
		audience: 'user',
		title: 'Un objet correspond au vôtre',
		message: 'Une annonce ressemble à votre objet perdu',
		link: '/posts/lost-item-1',
		read: false,
		userId: 'user-1',
		createdAt: new Date('2026-01-01'),
		readAt: null,
		...overrides,
	}
}

/** A desk notification belongs to nobody: that is what `userId: null` says. */
export function buildDeskNotification(
	overrides: Partial<Notification> = {},
): Notification {
	return buildNotification({
		id: 'notification-desk-1',
		type: 'listing_pending',
		audience: 'admin',
		title: 'Une annonce attend la modération',
		message: '« iPhone 13 perdu » vient d’être publiée.',
		link: '/posts',
		userId: null,
		...overrides,
	})
}

/** A concrete class now, so the double is a partial cast. */
export function buildRepository(): NotificationRepository {
	return {
		create: vi.fn(),
		findInScope: vi.fn(),
		list: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		countUnread: vi.fn(),
	} as unknown as NotificationRepository
}
