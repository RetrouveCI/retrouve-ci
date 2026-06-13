import { Inject, Injectable } from '@nestjs/common'
import { NotificationNotFoundError } from '../errors/notification.errors'
import type {
	Notification,
	NotificationListResponse,
} from '../models/notification.model'
import {
	NOTIFICATION_REPOSITORY,
	type NotificationRepository,
} from '../repository/notification.repository'
import type {
	CreateNotificationData,
	ListNotificationsFilter,
} from '../types/notification.types'

@Injectable()
export class NotificationUseCases {
	constructor(
		@Inject(NOTIFICATION_REPOSITORY)
		private readonly notificationRepository: NotificationRepository,
	) {}

	async create(data: CreateNotificationData): Promise<Notification> {
		return this.notificationRepository.create(data)
	}

	async listMine(
		userId: string,
		filter: Omit<ListNotificationsFilter, 'userId'>,
	): Promise<NotificationListResponse> {
		return this.notificationRepository.list({ ...filter, userId })
	}

	async markAsRead(id: string, userId: string): Promise<Notification> {
		const notification = await this.notificationRepository.findById(id)

		if (!notification || notification.userId !== userId) {
			throw new NotificationNotFoundError(id)
		}

		return this.notificationRepository.markAsRead(id)
	}

	async markAllAsRead(userId: string): Promise<void> {
		return this.notificationRepository.markAllAsRead(userId)
	}

	async getUnreadCount(userId: string): Promise<number> {
		return this.notificationRepository.countUnread(userId)
	}
}
