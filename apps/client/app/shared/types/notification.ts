import type { NotificationType } from '@/features/notifications/notifications.types'

export interface Notification {
	id: string
	type: NotificationType
	title: string
	message: string
	link: string | null
	read: boolean
	relativeDate: string
}
