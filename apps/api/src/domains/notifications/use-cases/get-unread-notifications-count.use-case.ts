import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'

/** Answers a bare number — both front-ends' unread badge reads it that way. */
@Injectable()
export class GetUnreadNotificationsCountUseCase
	implements IDomainUseCase<string, number>
{
	constructor(private readonly repository: NotificationRepository) {}

	async execute(userId: string): Promise<number> {
		return this.repository.countUnread(userId)
	}
}
