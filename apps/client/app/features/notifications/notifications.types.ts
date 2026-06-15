export type NotificationType = 'match_found'

export interface NotificationApiDto {
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

export interface NotificationListApiResponse {
	items: NotificationApiDto[]
	total: number
	page: number
	pageSize: number
}
