import { Injectable } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireEvent } from '../helpers/require-event'
import { EventRepository } from '../repository/event.repository'
import type { Event } from '../types/event.types'

@Injectable()
export class GetEventByIdUseCase implements IDomainUseCase<string, Event> {
	constructor(private readonly repository: EventRepository) {}

	async execute(id: string): Promise<Event> {
		return requireEvent(this.repository, id)
	}
}
