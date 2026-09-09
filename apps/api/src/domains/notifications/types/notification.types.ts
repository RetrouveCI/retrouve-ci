import type {
	ADMIN_NOTIFICATION_TYPES,
	ListNotificationsFilterData,
	NotificationAudience,
	NotificationType,
	USER_NOTIFICATION_TYPES,
} from '@app/contracts/notifications'
import type { Paginated } from '@/shared/utils/pagination.util'

export type { NotificationAudience, NotificationType }

export type UserNotificationType = (typeof USER_NOTIFICATION_TYPES)[number]
export type AdminNotificationType = (typeof ADMIN_NOTIFICATION_TYPES)[number]

interface NotificationContent {
	title: string
	message: string
	link?: string
}

// Raised by the app, never posted. Two shapes, so the compiler refuses a desk
// notification with an owner and a visitor's without one.
export type CreateNotificationData =
	| (NotificationContent & { type: UserNotificationType; userId: string })
	| (NotificationContent & {
			type: AdminNotificationType
			userId?: never
	  })

// Whose notifications a read touches. The desk's belong to nobody, so the first
// administrator who reads one reads it for all — what a work queue wants.
export type NotificationScope =
	{ audience: 'user'; userId: string } | { audience: 'admin' }

export type ListNotificationsFilter = ListNotificationsFilterData & {
	scope: NotificationScope
}

export interface Notification {
	id: string
	type: NotificationType
	audience: NotificationAudience
	title: string
	message: string
	link: string | null
	read: boolean
	userId: string | null
	createdAt: Date
	readAt: Date | null
}

export type NotificationListResponse = Paginated<Notification>
