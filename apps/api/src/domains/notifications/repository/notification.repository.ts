import type {
	Notification,
	NotificationListResponse,
} from '../models/notification.model'
import type {
	CreateNotificationData,
	ListNotificationsFilter,
} from '../types/notification.types'

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY')

export interface NotificationRepository {
	create(data: CreateNotificationData): Promise<Notification>
	findById(id: string): Promise<Notification | null>
	list(filter: ListNotificationsFilter): Promise<NotificationListResponse>
	markAsRead(id: string): Promise<Notification>
	markAllAsRead(userId: string): Promise<void>
	countUnread(userId: string): Promise<number>
}
