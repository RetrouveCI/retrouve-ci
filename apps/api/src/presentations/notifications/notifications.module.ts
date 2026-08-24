import { Module } from '@nestjs/common'
import { NotificationsDomainModule } from '@/domains/notifications/notifications-domain.module'
import { NotificationsController } from './notifications.controller'

@Module({
	imports: [NotificationsDomainModule],
	controllers: [NotificationsController],
})
export class NotificationsModule {}
