import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationNotFoundError } from '../errors/notification.errors'
import { NotificationRepository } from '../repository/notification.repository'
import type {
	Notification,
	NotificationScope,
} from '../types/notification.types'

interface MarkNotificationAsReadInput {
	id: string
	scope: NotificationScope
}

@Injectable()
export class MarkNotificationAsReadUseCase implements IDomainUseCase<
	MarkNotificationAsReadInput,
	Notification
> {
	private readonly logger = new Logger(MarkNotificationAsReadUseCase.name)

	constructor(private readonly repository: NotificationRepository) {}

	// Out of scope answers "not found", not "forbidden". The scope is part of the
	// query, so a lookup never returns a row this caller would have to be denied.
	async execute({
		id,
		scope,
	}: MarkNotificationAsReadInput): Promise<Notification> {
		const notification = await this.repository.findInScope(id, scope)

		if (!notification) {
			throw new NotificationNotFoundError(id)
		}

		if (notification.read) {
			return notification
		}

		const updated = await this.repository.markAsRead(id)
		this.logger.log(`Notification ${id} marked as read`)

		return updated
	}
}
