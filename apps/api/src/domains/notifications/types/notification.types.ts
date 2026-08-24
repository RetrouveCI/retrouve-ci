import type {
	ListNotificationsFilterData,
	NotificationType,
} from '@app/contracts/notifications'
import type { Paginated } from '@/shared/utils/pagination.util'

export type { NotificationType }

/** Created by the app itself — a match, a QR scan — never posted over HTTP. */
export interface CreateNotificationData {
	type: NotificationType
	title: string
	message: string
	link?: string
	userId: string
}

/** `userId` comes from the session, never from the query string. */
export type ListNotificationsFilter = ListNotificationsFilterData & {
	userId: string
}

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	link: string | null
	read: boolean
	userId: string
	createdAt: Date
	readAt: Date | null
}

export type NotificationListResponse = Paginated<Notification>
