import { vi } from 'vitest'
import type { NotificationRepository } from '../repository/notification.repository'
import type { Notification } from '../types/notification.types'

export function buildNotification(
	overrides: Partial<Notification> = {},
): Notification {
	return {
		id: 'notification-1',
		type: 'match_found',
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

/** A concrete class now, so the double is a partial cast. */
export function buildRepository(): NotificationRepository {
	return {
		create: vi.fn(),
		findById: vi.fn(),
		list: vi.fn(),
		markAsRead: vi.fn(),
		markAllAsRead: vi.fn(),
		countUnread: vi.fn(),
	} as unknown as NotificationRepository
}
