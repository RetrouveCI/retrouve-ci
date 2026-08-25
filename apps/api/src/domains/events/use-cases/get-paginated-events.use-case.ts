import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { EventRepository } from '../repository/event.repository'
import type { EventListResponse, ListEventsFilter } from '../types/event.types'

@Injectable()
export class GetPaginatedEventsUseCase implements IDomainUseCase<
	ListEventsFilter,
	EventListResponse
> {
	constructor(private readonly repository: EventRepository) {}

	async execute(filter: ListEventsFilter): Promise<EventListResponse> {
		return this.repository.list(filter)
	}
}
