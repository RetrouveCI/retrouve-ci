import { Module } from '@nestjs/common'
import { EventsDomainModule } from '@/domains/events/events-domain.module'
import { EventsController } from './events.controller'

@Module({
	imports: [EventsDomainModule],
	controllers: [EventsController],
})
export class EventsModule {}
