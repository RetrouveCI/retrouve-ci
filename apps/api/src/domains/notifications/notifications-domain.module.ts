import { Module } from '@nestjs/common'
import { NotificationRepository } from './repository/notification.repository'
import { PushSubscriptionRepository } from './repository/push-subscription.repository'
import { CreateNotificationUseCase } from './use-cases/create-notification.use-case'
import { GetMyNotificationsUseCase } from './use-cases/get-my-notifications.use-case'
import { GetUnreadNotificationsCountUseCase } from './use-cases/get-unread-notifications-count.use-case'
import { MarkAllNotificationsAsReadUseCase } from './use-cases/mark-all-notifications-as-read.use-case'
import { MarkNotificationAsReadUseCase } from './use-cases/mark-notification-as-read.use-case'
import { CountPushSubscriptionsUseCase } from './use-cases/count-push-subscriptions.use-case'
import { SubscribeToPushUseCase } from './use-cases/subscribe-to-push.use-case'
import { UnsubscribeFromPushUseCase } from './use-cases/unsubscribe-from-push.use-case'

@Module({
	providers: [
		NotificationRepository,
		CreateNotificationUseCase,
		GetMyNotificationsUseCase,
		GetUnreadNotificationsCountUseCase,
		MarkNotificationAsReadUseCase,
		MarkAllNotificationsAsReadUseCase,
		PushSubscriptionRepository,
		SubscribeToPushUseCase,
		UnsubscribeFromPushUseCase,
		CountPushSubscriptionsUseCase,
	],
	exports: [
		NotificationRepository,
		CreateNotificationUseCase,
		GetMyNotificationsUseCase,
		GetUnreadNotificationsCountUseCase,
		MarkNotificationAsReadUseCase,
		MarkAllNotificationsAsReadUseCase,
		PushSubscriptionRepository,
		SubscribeToPushUseCase,
		UnsubscribeFromPushUseCase,
		CountPushSubscriptionsUseCase,
	],
})
export class NotificationsDomainModule {}
