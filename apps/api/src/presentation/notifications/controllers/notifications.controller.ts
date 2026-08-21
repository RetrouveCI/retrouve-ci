import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	listNotificationsFilterSchema,
	type ListNotificationsFilterData,
} from '@app/contracts/notifications'
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructure/auth/auth.config'
import { NotificationUseCases } from '@/domains/notifications/use-cases/notification.use-cases'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationUseCases: NotificationUseCases) {}

	@Get('mine')
	@ApiZodQuery(listNotificationsFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listNotificationsFilterSchema))
		filter: ListNotificationsFilterData,
	) {
		return this.notificationUseCases.listMine(session.user.id, filter)
	}

	@Get('unread-count')
	getUnreadCount(@Session() session: UserSession<Auth>) {
		return this.notificationUseCases.getUnreadCount(session.user.id)
	}

	@Patch('read-all')
	markAllAsRead(@Session() session: UserSession<Auth>) {
		return this.notificationUseCases.markAllAsRead(session.user.id)
	}

	@Patch(':id/read')
	markAsRead(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.notificationUseCases.markAsRead(id, session.user.id)
	}
}
