import type {
	NotificationType,
	USER_NOTIFICATION_TYPES,
} from '@app/contracts/notifications'

export type { NotificationType }

/** What this app can actually receive, the desk's being filtered out server-side. */
export type UserNotificationType = (typeof USER_NOTIFICATION_TYPES)[number]

export interface NotificationApiDto {
	id: string
	type: NotificationType
	title: string
	message: string
	link: string | null
	read: boolean
	userId: string | null
	createdAt: string
	readAt: string | null
}

export interface NotificationListApiResponse {
	items: NotificationApiDto[]
	total: number
	page: number
	pageSize: number
}
