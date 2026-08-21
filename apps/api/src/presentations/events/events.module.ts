import { Module } from '@nestjs/common'
import { EVENT_REPOSITORY } from '@/domains/events/repository/event.repository'
import { EventRepositoryService } from '@/domains/events/repository/event.repository.service'
import { EventUseCases } from '@/domains/events/use-cases/event.use-cases'
import { EventsController } from './controllers/events.controller'

@Module({
	controllers: [EventsController],
	providers: [
		EventUseCases,
		{
			provide: EVENT_REPOSITORY,
			useClass: EventRepositoryService,
		},
	],
})
export class EventsModule {}
