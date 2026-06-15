export type NotificationType = 'match_found'

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
