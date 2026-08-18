import type { NotificationType } from '@/routes/notifications/types/notifications.types'

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	link: string | null
	read: boolean
	createdAt: string
	relativeDate: string
}
