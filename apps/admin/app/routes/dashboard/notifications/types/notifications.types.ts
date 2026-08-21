import type { NotificationType } from '@app/contracts/notifications'

export type { NotificationType }

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	link: string | null
	read: boolean
	userId: string
	createdAt: string
	readAt: string | null
}

export interface NotificationListResponse {
	items: Notification[]
	total: number
	page: number
	pageSize: number
}
