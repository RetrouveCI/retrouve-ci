import { Module } from '@nestjs/common'
import { EventRepository } from './repository/event.repository'
import { CreateEventUseCase } from './use-cases/create-event.use-case'
import { DeleteEventUseCase } from './use-cases/delete-event.use-case'
import { GetEventByIdUseCase } from './use-cases/get-event-by-id.use-case'
import { GetPaginatedEventsUseCase } from './use-cases/get-paginated-events.use-case'
import { UpdateEventUseCase } from './use-cases/update-event.use-case'

@Module({
	providers: [
		EventRepository,
		CreateEventUseCase,
		GetEventByIdUseCase,
		GetPaginatedEventsUseCase,
		UpdateEventUseCase,
		DeleteEventUseCase,
	],
	exports: [
		EventRepository,
		CreateEventUseCase,
		GetEventByIdUseCase,
		GetPaginatedEventsUseCase,
		UpdateEventUseCase,
		DeleteEventUseCase,
	],
})
export class EventsDomainModule {}
