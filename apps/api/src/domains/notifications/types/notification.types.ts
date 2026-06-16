export type NotificationType = 'match_found' | 'qr_scan'

export interface CreateNotificationData {
	type: NotificationType
	title: string
	message: string
	link?: string
	userId: string
}

export interface ListNotificationsFilter {
	userId: string
	read?: boolean
	page: number
	pageSize: number
}
