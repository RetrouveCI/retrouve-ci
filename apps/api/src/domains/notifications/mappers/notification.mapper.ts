import {
	NotificationAudience as PrismaNotificationAudience,
	NotificationType as PrismaNotificationType,
	type Notification as PrismaNotification,
} from '@app/database'

import type {
	Notification,
	NotificationAudience,
	NotificationType,
} from '../types/notification.types'

export function toDomainNotification(
	notification: PrismaNotification,
): Notification {
	return {
		id: notification.id,
		type: toDomainType(notification.type),
		audience: toDomainAudience(notification.audience),
		title: notification.title,
		message: notification.message,
		link: notification.link,
		read: notification.read,
		userId: notification.userId,
		createdAt: notification.createdAt,
		readAt: notification.readAt,
	}
}

// Both switches are exhaustive, so a value added on either side is a
// compilation error rather than a silent fallthrough.
export function toPrismaType(type: NotificationType): PrismaNotificationType {
	switch (type) {
		case 'match_found':
			return PrismaNotificationType.MATCH_FOUND
		case 'qr_scan':
			return PrismaNotificationType.QR_SCAN
		case 'stickers_delivered':
			return PrismaNotificationType.STICKERS_DELIVERED
		case 'listing_pending':
			return PrismaNotificationType.LISTING_PENDING
		case 'listing_moderated':
			return PrismaNotificationType.LISTING_MODERATED
		case 'listing_contacted':
			return PrismaNotificationType.LISTING_CONTACTED
		case 'order_placed':
			return PrismaNotificationType.ORDER_PLACED
		case 'contact_received':
			return PrismaNotificationType.CONTACT_RECEIVED
		case 'order_processing':
			return PrismaNotificationType.ORDER_PROCESSING
		case 'order_shipped':
			return PrismaNotificationType.ORDER_SHIPPED
		case 'order_cancelled':
			return PrismaNotificationType.ORDER_CANCELLED
	}
}

export function toDomainType(type: PrismaNotificationType): NotificationType {
	switch (type) {
		case PrismaNotificationType.MATCH_FOUND:
			return 'match_found'
		case PrismaNotificationType.QR_SCAN:
			return 'qr_scan'
		case PrismaNotificationType.STICKERS_DELIVERED:
			return 'stickers_delivered'
		case PrismaNotificationType.LISTING_PENDING:
			return 'listing_pending'
		case PrismaNotificationType.LISTING_MODERATED:
			return 'listing_moderated'
		case PrismaNotificationType.LISTING_CONTACTED:
			return 'listing_contacted'
		case PrismaNotificationType.ORDER_PLACED:
			return 'order_placed'
		case PrismaNotificationType.CONTACT_RECEIVED:
			return 'contact_received'
		case PrismaNotificationType.ORDER_PROCESSING:
			return 'order_processing'
		case PrismaNotificationType.ORDER_SHIPPED:
			return 'order_shipped'
		case PrismaNotificationType.ORDER_CANCELLED:
			return 'order_cancelled'
	}
}

export function toPrismaAudience(
	audience: NotificationAudience,
): PrismaNotificationAudience {
	switch (audience) {
		case 'user':
			return PrismaNotificationAudience.USER
		case 'admin':
			return PrismaNotificationAudience.ADMIN
	}
}

export function toDomainAudience(
	audience: PrismaNotificationAudience,
): NotificationAudience {
	switch (audience) {
		case PrismaNotificationAudience.USER:
			return 'user'
		case PrismaNotificationAudience.ADMIN:
			return 'admin'
	}
}
