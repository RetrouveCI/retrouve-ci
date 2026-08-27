import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationNotFoundError } from '../errors/notification.errors'
import { NotificationRepository } from '../repository/notification.repository'
import type { Notification } from '../types/notification.types'

interface MarkNotificationAsReadInput {
	id: string
	userId: string
}

@Injectable()
export class MarkNotificationAsReadUseCase implements IDomainUseCase<
	MarkNotificationAsReadInput,
	Notification
> {
	private readonly logger = new Logger(MarkNotificationAsReadUseCase.name)

	constructor(private readonly repository: NotificationRepository) {}

	/**
	 * A notification belonging to someone else answers "not found" rather than
	 * "forbidden": telling a caller that an id exists but is not theirs leaks
	 * more than it helps.
	 */
	async execute({
		id,
		userId,
	}: MarkNotificationAsReadInput): Promise<Notification> {
		const notification = await this.repository.findById(id)

		if (!notification || notification.userId !== userId) {
			throw new NotificationNotFoundError(id)
		}

		this.logger.log(`Notification ${id} marked as read`)

		return this.repository.markAsRead(id)
	}
}
