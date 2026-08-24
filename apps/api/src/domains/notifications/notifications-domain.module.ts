import { Module } from '@nestjs/common'
import { NotificationRepository } from './repository/notification.repository'
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case'
import { GetMyNotificationsUseCase } from './use-cases/get-my-notifications.use-case'
import { GetUnreadNotificationsCountUseCase } from './use-cases/get-unread-notifications-count.use-case'
import { MarkAllNotificationsAsReadUseCase } from './use-cases/mark-all-notifications-as-read.use-case'
import { MarkNotificationAsReadUseCase } from './use-cases/mark-notification-as-read.use-case'

@Module({
	providers: [
		NotificationRepository,
		CreateNotificationUseCase,
		GetMyNotificationsUseCase,
		GetUnreadNotificationsCountUseCase,
		MarkNotificationAsReadUseCase,
		MarkAllNotificationsAsReadUseCase,
	],
	exports: [
		NotificationRepository,
		CreateNotificationUseCase,
		GetMyNotificationsUseCase,
		GetUnreadNotificationsCountUseCase,
		MarkNotificationAsReadUseCase,
		MarkAllNotificationsAsReadUseCase,
	],
})
export class NotificationsDomainModule {}
