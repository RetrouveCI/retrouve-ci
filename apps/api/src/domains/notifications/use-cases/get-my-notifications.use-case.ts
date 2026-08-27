import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import type {
	ListNotificationsFilter,
	NotificationListResponse,
} from '../types/notification.types'

interface GetMyNotificationsInput {
	userId: string
	filter: Omit<ListNotificationsFilter, 'userId'>
}

/**
 * The `userId` comes from the session, never from the query, so a caller cannot
 * read someone else's notifications by asking.
 */
@Injectable()
export class GetMyNotificationsUseCase implements IDomainUseCase<
	GetMyNotificationsInput,
	NotificationListResponse
> {
	constructor(private readonly repository: NotificationRepository) {}

	async execute({
		userId,
		filter,
	}: GetMyNotificationsInput): Promise<NotificationListResponse> {
		return this.repository.list({ ...filter, userId })
	}
}
