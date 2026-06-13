import { Module } from '@nestjs/common'
import { NOTIFICATION_REPOSITORY } from '@/domains/notifications/repository/notification.repository'
import { NotificationRepositoryService } from '@/domains/notifications/repository/notification.repository.service'
import { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { NotificationsController } from './controllers/notifications.controller'

@Module({
	controllers: [NotificationsController],
	providers: [
		NotificationUseCases,
		{
			provide: NOTIFICATION_REPOSITORY,
			useClass: NotificationRepositoryService,
		},
	],
	exports: [NotificationUseCases, NOTIFICATION_REPOSITORY],
})
export class NotificationsModule {}
