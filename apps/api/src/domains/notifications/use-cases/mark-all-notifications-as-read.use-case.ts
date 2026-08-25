import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'

@Injectable()
export class MarkAllNotificationsAsReadUseCase implements IDomainUseCase<
	string,
	void
> {
	private readonly logger = new Logger(MarkAllNotificationsAsReadUseCase.name)

	constructor(private readonly repository: NotificationRepository) {}

	async execute(userId: string): Promise<void> {
		await this.repository.markAllAsRead(userId)

		this.logger.log(`All notifications marked as read for user ${userId}`)
	}
}
