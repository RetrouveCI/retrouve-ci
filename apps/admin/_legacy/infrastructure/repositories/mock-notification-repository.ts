import type { INotificationRepository } from '@/domain/repositories/notification-repository'
import type { Notification } from '@/domain/entities/notification'
import { MOCK_NOTIFICATIONS } from '@/infrastructure/mock/data'

class MockNotificationRepository implements INotificationRepository {
	private notifications: Notification[] = [...MOCK_NOTIFICATIONS]

	async getAll(): Promise<Notification[]> {
		return [...this.notifications]
	}

	async markAsRead(id: number): Promise<void> {
		this.notifications = this.notifications.map(n =>
			n.id === id ? { ...n, read: true } : n,
		)
	}

	async markAllAsRead(): Promise<void> {
		this.notifications = this.notifications.map(n => ({ ...n, read: true }))
	}

	async delete(id: number): Promise<void> {
		this.notifications = this.notifications.filter(n => n.id !== id)
	}
}

export const notificationRepository: INotificationRepository =
	new MockNotificationRepository()
