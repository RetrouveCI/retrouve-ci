import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	listNotificationsFilterSchema,
	pushSubscriptionSchema,
	pushUnsubscribeSchema,
	type ListNotificationsFilterData,
	type PushSubscriptionData,
	type PushUnsubscribeData,
} from '@app/contracts/notifications'
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { Audience } from '@/shared/auth/decorators/audience.decorator'
import type { SessionAudience } from '@/shared/auth/session-audience'
import { notificationScope } from '@/domains/notifications/helpers/notification-scope'
import { GetMyNotificationsUseCase } from '@/domains/notifications/use-cases/get-my-notifications.use-case'
import { GetUnreadNotificationsCountUseCase } from '@/domains/notifications/use-cases/get-unread-notifications-count.use-case'
import { MarkAllNotificationsAsReadUseCase } from '@/domains/notifications/use-cases/mark-all-notifications-as-read.use-case'
import { MarkNotificationAsReadUseCase } from '@/domains/notifications/use-cases/mark-notification-as-read.use-case'
import { SubscribeToPushUseCase } from '@/domains/notifications/use-cases/subscribe-to-push.use-case'
import { UnsubscribeFromPushUseCase } from '@/domains/notifications/use-cases/unsubscribe-from-push.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
	constructor(
		private readonly getMyNotifications: GetMyNotificationsUseCase,
		private readonly getUnreadNotificationsCount: GetUnreadNotificationsCountUseCase,
		private readonly markAllNotificationsAsRead: MarkAllNotificationsAsReadUseCase,
		private readonly markNotificationAsRead: MarkNotificationAsReadUseCase,
		private readonly subscribeToPush: SubscribeToPushUseCase,
		private readonly unsubscribeFromPush: UnsubscribeFromPushUseCase,
	) {}

	// `mine` is a misnomer for the backoffice, which reads the desk's — the path
	// is kept so no front changes. The guard's audience decides, not a parameter.
	@Get('mine')
	@ApiZodQuery(listNotificationsFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Query(new ZodValidationPipe(listNotificationsFilterSchema))
		filter: ListNotificationsFilterData,
	) {
		return this.getMyNotifications.execute({
			scope: notificationScope(audience, session.user),
			filter,
		})
	}

	@Get('unread-count')
	getUnreadCount(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
	) {
		return this.getUnreadNotificationsCount.execute(
			notificationScope(audience, session.user),
		)
	}

	@Patch('read-all')
	markAllAsRead(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
	) {
		return this.markAllNotificationsAsRead.execute(
			notificationScope(audience, session.user),
		)
	}

	// A3's measurable half: the row records a capability the visitor granted, and
	// counting the rows is what answers « would a push reach anyone ». Keyed on
	// the endpoint, so re-subscribing moves the row instead of adding one.
	@Post('push')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiZodBody(pushSubscriptionSchema)
	async subscribe(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(pushSubscriptionSchema))
		{ endpoint, keys }: PushSubscriptionData,
	): Promise<void> {
		await this.subscribeToPush.execute({
			userId: session.user.id,
			endpoint,
			p256dh: keys.p256dh,
			auth: keys.auth,
		})
	}

	@Delete('push')
	@HttpCode(HttpStatus.NO_CONTENT)
	@ApiZodQuery(pushUnsubscribeSchema)
	async unsubscribe(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(pushUnsubscribeSchema))
		{ endpoint }: PushUnsubscribeData,
	): Promise<void> {
		await this.unsubscribeFromPush.execute({
			userId: session.user.id,
			endpoint,
		})
	}

	@Patch(':id/read')
	markAsRead(
		@Session() session: UserSession<Auth>,
		@Audience() audience: SessionAudience,
		@Param('id') id: string,
	) {
		return this.markNotificationAsRead.execute({
			id,
			scope: notificationScope(audience, session.user),
		})
	}
}
