import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import { PushToSubscribersUseCase } from './push-to-subscribers.use-case'
import type {
	CreateNotificationData,
	Notification,
} from '../types/notification.types'

/** Notifications are raised by the app — a match, a QR scan — never posted. */
@Injectable()
export class CreateNotificationUseCase implements IDomainUseCase<
	CreateNotificationData,
	Notification
> {
	private readonly logger = new Logger(CreateNotificationUseCase.name)

	constructor(
		private readonly repository: NotificationRepository,
		private readonly pushToSubscribers: PushToSubscribersUseCase,
	) {}

	async execute(data: CreateNotificationData): Promise<Notification> {
		const notification = await this.repository.create(data)

		this.logger.log(
			`Notification ${notification.id} (${data.type}) raised for ${
				data.userId ? `user ${data.userId}` : 'the desk'
			}`,
		)

		await this.push(data)

		return notification
	}

	/**
	 * ⚠️ Swallows on its own account, and that is load-bearing: `notify-matches`
	 * deliberately does **not** swallow so BullMQ retries its job, and a retry
	 * re-creates the rows. A failing push must never reach that far.
	 */
	private async push(data: CreateNotificationData): Promise<void> {
		if (!data.userId) return

		try {
			await this.pushToSubscribers.execute({
				userId: data.userId,
				title: data.title,
				message: data.message,
				link: data.link ?? undefined,
			})
		} catch (error) {
			this.logger.error(`Push for ${data.type} failed: ${String(error)}`)
		}
	}
}
