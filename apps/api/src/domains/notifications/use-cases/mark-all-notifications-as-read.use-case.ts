import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import type { NotificationScope } from '../types/notification.types'

const describe = (scope: NotificationScope) =>
	scope.audience === 'admin' ? 'the desk' : `user ${scope.userId}`

@Injectable()
export class MarkAllNotificationsAsReadUseCase implements IDomainUseCase<
	NotificationScope,
	void
> {
	private readonly logger = new Logger(MarkAllNotificationsAsReadUseCase.name)

	constructor(private readonly repository: NotificationRepository) {}

	async execute(scope: NotificationScope): Promise<void> {
		await this.repository.markAllAsRead(scope)
		this.logger.log(`All notifications marked as read for ${describe(scope)}`)
	}
}
