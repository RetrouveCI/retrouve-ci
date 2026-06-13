import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { auth } from '@/infrastructure/auth/auth.config'
import { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { ListNotificationsQueryDto } from '../dto/list-notifications.query.dto'

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationUseCases: NotificationUseCases) {}

	@Get('mine')
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListNotificationsQueryDto,
	) {
		return this.notificationUseCases.listMine(session.user.id, query)
	}

	@Get('unread-count')
	getUnreadCount(@Session() session: UserSession<typeof auth>) {
		return this.notificationUseCases.getUnreadCount(session.user.id)
	}

	@Patch('read-all')
	markAllAsRead(@Session() session: UserSession<typeof auth>) {
		return this.notificationUseCases.markAllAsRead(session.user.id)
	}

	@Patch(':id/read')
	markAsRead(
		@Session() session: UserSession<typeof auth>,
		@Param('id') id: string,
	) {
		return this.notificationUseCases.markAsRead(id, session.user.id)
	}
}
