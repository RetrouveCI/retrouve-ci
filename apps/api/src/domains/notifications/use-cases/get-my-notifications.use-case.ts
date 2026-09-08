import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { NotificationRepository } from '../repository/notification.repository'
import type {
	ListNotificationsFilter,
	NotificationListResponse,
	NotificationScope,
} from '../types/notification.types'

interface GetMyNotificationsInput {
	scope: NotificationScope
	filter: Omit<ListNotificationsFilter, 'scope'>
}

// The scope comes from the session and the guard, never from the query: a caller
// can neither read someone else's nor claim the desk's by asking.
@Injectable()
export class GetMyNotificationsUseCase implements IDomainUseCase<
	GetMyNotificationsInput,
	NotificationListResponse
> {
	constructor(private readonly repository: NotificationRepository) {}

	async execute({
		scope,
		filter,
	}: GetMyNotificationsInput): Promise<NotificationListResponse> {
		return this.repository.list({ ...filter, scope })
	}
}
