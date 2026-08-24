import { Injectable, Logger } from '@nestjs/common'
import type { IDomainUseCase } from '@/shared/types/domain-use-case.type'
import { requireEvent } from '../helpers/require-event'
import { EventRepository } from '../repository/event.repository'

@Injectable()
export class DeleteEventUseCase implements IDomainUseCase<string, void> {
	private readonly logger = new Logger(DeleteEventUseCase.name)

	constructor(private readonly repository: EventRepository) {}

	async execute(id: string): Promise<void> {
		await requireEvent(this.repository, id)

		await this.repository.delete(id)

		this.logger.log(`Event ${id} deleted`)
	}
}
