import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import type { NotificationScope } from '../types/notification.types'

/** Answers a bare number — both front-ends' unread badge reads it that way. */
@Injectable()
export class GetUnreadNotificationsCountUseCase implements IDomainUseCase<
	NotificationScope,
	number
> {
	constructor(private readonly repository: NotificationRepository) {}

	async execute(scope: NotificationScope): Promise<number> {
		return this.repository.countUnread(scope)
	}
}
