import type {
	ListNotificationsFilterData,
	NotificationType,
} from '@app/contracts/notifications'

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
