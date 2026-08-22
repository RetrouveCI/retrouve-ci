import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { EventRepository } from '../repository/event.repository'
import type { CreateEventData, Event } from '../types/event.types'

@Injectable()
export class CreateEventUseCase
	implements IDomainUseCase<CreateEventData, Event>
{
	private readonly logger = new Logger(CreateEventUseCase.name)

	constructor(private readonly repository: EventRepository) {}

	async execute(data: CreateEventData): Promise<Event> {
		const event = await this.repository.create(data)

		this.logger.log(`Event ${event.id} created`)

		return event
	}
}
