import { Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	listNotificationsFilterSchema,
	type ListNotificationsFilterData,
} from '@app/contracts/notifications'
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { GetMyNotificationsUseCase } from '@/domains/notifications/use-cases/get-my-notifications.use-case'
import { GetUnreadNotificationsCountUseCase } from '@/domains/notifications/use-cases/get-unread-notifications-count.use-case'
import { MarkAllNotificationsAsReadUseCase } from '@/domains/notifications/use-cases/mark-all-notifications-as-read.use-case'
import { MarkNotificationAsReadUseCase } from '@/domains/notifications/use-cases/mark-notification-as-read.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
	constructor(
		private readonly getMyNotifications: GetMyNotificationsUseCase,
		private readonly getUnreadNotificationsCount: GetUnreadNotificationsCountUseCase,
		private readonly markAllNotificationsAsRead: MarkAllNotificationsAsReadUseCase,
		private readonly markNotificationAsRead: MarkNotificationAsReadUseCase,
	) {}

	@Get('mine')
	@ApiZodQuery(listNotificationsFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listNotificationsFilterSchema))
		filter: ListNotificationsFilterData,
	) {
		return this.getMyNotifications.execute({ userId: session.user.id, filter })
	}

	@Get('unread-count')
	getUnreadCount(@Session() session: UserSession<Auth>) {
		return this.getUnreadNotificationsCount.execute(session.user.id)
	}

	@Patch('read-all')
	markAllAsRead(@Session() session: UserSession<Auth>) {
		return this.markAllNotificationsAsRead.execute(session.user.id)
	}

	@Patch(':id/read')
	markAsRead(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.markNotificationAsRead.execute({ id, userId: session.user.id })
	}
}
