import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireEvent } from '../helpers/require-event'
import { EventRepository } from '../repository/event.repository'
import type { Event, UpdateEventData } from '../types/event.types'

interface UpdateEventInput {
	id: string
	data: UpdateEventData
}

@Injectable()
export class UpdateEventUseCase implements IDomainUseCase<
	UpdateEventInput,
	Event
> {
	private readonly logger = new Logger(UpdateEventUseCase.name)

	constructor(private readonly repository: EventRepository) {}

	async execute({ id, data }: UpdateEventInput): Promise<Event> {
		await requireEvent(this.repository, id)

		this.logger.log(`Event ${id} updated`)

		return this.repository.update(id, data)
	}
}
