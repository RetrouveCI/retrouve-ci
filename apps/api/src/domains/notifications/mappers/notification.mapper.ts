import {
	NotificationType as PrismaNotificationType,
	type Notification as PrismaNotification,
} from '@retrouve-ci/database'

import type { Notification } from '../models/notification.model'
import type { NotificationType } from '../types/notification.types'

export function toDomainNotification(
	notification: PrismaNotification,
): Notification {
	return {
		id: notification.id,
		type: toDomainType(notification.type),
		title: notification.title,
		message: notification.message,
		link: notification.link,
		read: notification.read,
		userId: notification.userId,
		createdAt: notification.createdAt,
		readAt: notification.readAt,
	}
}

export function toPrismaType(type: NotificationType): PrismaNotificationType {
	switch (type) {
		case 'match_found':
			return PrismaNotificationType.MATCH_FOUND
		case 'qr_scan':
			return PrismaNotificationType.QR_SCAN
	}
}

export function toDomainType(type: PrismaNotificationType): NotificationType {
	switch (type) {
		case PrismaNotificationType.MATCH_FOUND:
			return 'match_found'
		case PrismaNotificationType.QR_SCAN:
			return 'qr_scan'
	}
}
