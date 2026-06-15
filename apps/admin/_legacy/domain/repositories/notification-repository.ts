import type { Notification } from '@/domain/entities/notification'

export interface INotificationRepository {
	getAll(): Promise<Notification[]>
	markAsRead(id: number): Promise<void>
	markAllAsRead(): Promise<void>
	delete(id: number): Promise<void>
}
