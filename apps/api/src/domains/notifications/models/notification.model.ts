import type { NotificationType } from '../types/notification.types'

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

export interface NotificationListResponse {
	items: Notification[]
	total: number
	page: number
	pageSize: number
}
