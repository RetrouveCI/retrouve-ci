import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import type {
	CreateNotificationData,
	Notification,
} from '../types/notification.types'

/** Notifications are raised by the app — a match, a QR scan — never posted. */
@Injectable()
export class CreateNotificationUseCase
	implements IDomainUseCase<CreateNotificationData, Notification>
{
	private readonly logger = new Logger(CreateNotificationUseCase.name)

	constructor(private readonly repository: NotificationRepository) {}

	async execute(data: CreateNotificationData): Promise<Notification> {
		const notification = await this.repository.create(data)

		this.logger.log(
			`Notification ${notification.id} (${data.type}) raised for user ${data.userId}`,
		)

		return notification
	}
}
