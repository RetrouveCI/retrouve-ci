import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requirePublishedEvent } from '../helpers/require-published-event'
import { EventRepository } from '../repository/event.repository'
import type { Event } from '../types/event.types'

@Injectable()
export class GetEventByIdUseCase implements IDomainUseCase<string, Event> {
	constructor(private readonly repository: EventRepository) {}

	/** Read by the anonymous route alone, so the published rule lives here. */
	async execute(id: string): Promise<Event> {
		return requirePublishedEvent(this.repository, id)
	}
}
