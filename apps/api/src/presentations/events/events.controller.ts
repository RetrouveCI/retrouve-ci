import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	adminListEventsFilterSchema,
	createEventSchema,
	listEventsFilterSchema,
	updateEventSchema,
	type AdminListEventsFilterData,
	type CreateEventData,
	type ListEventsFilterData,
	type UpdateEventData,
} from '@app/contracts/events'
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { CreateEventUseCase } from '@/domains/events/use-cases/create-event.use-case'
import { DeleteEventUseCase } from '@/domains/events/use-cases/delete-event.use-case'
import { GetEventByIdUseCase } from '@/domains/events/use-cases/get-event-by-id.use-case'
import { GetPaginatedEventsUseCase } from '@/domains/events/use-cases/get-paginated-events.use-case'
import { UpdateEventUseCase } from '@/domains/events/use-cases/update-event.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
	constructor(
		private readonly createEvent: CreateEventUseCase,
		private readonly getPaginatedEvents: GetPaginatedEventsUseCase,
		private readonly getEventById: GetEventByIdUseCase,
		private readonly updateEvent: UpdateEventUseCase,
		private readonly deleteEvent: DeleteEventUseCase,
	) {}

	@Post()
	@Roles(['admin'])
	@ApiZodBody(createEventSchema)
	create(
		@Body(new ZodValidationPipe(createEventSchema)) data: CreateEventData,
	) {
		return this.createEvent.execute({
			...data,
			eventDate: new Date(data.eventDate),
		})
	}

	@Get()
	@AllowAnonymous()
	@ApiZodQuery(listEventsFilterSchema)
	list(
		@Query(new ZodValidationPipe(listEventsFilterSchema))
		filter: ListEventsFilterData,
	) {
		return this.getPaginatedEvents.execute({ ...filter, status: 'published' })
	}

	@Get('admin')
	@Roles(['admin'])
	@ApiZodQuery(adminListEventsFilterSchema)
	listForAdmin(
		@Query(new ZodValidationPipe(adminListEventsFilterSchema))
		filter: AdminListEventsFilterData,
	) {
		return this.getPaginatedEvents.execute(filter)
	}

	@Get(':id')
	@AllowAnonymous()
	getOne(@Param('id') id: string) {
		return this.getEventById.execute(id)
	}

	@Patch(':id')
	@Roles(['admin'])
	@ApiZodBody(updateEventSchema)
	update(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateEventSchema)) data: UpdateEventData,
	) {
		const { eventDate, ...rest } = data

		return this.updateEvent.execute({
			id,
			data: {
				...rest,
				...(eventDate && { eventDate: new Date(eventDate) }),
			},
		})
	}

	@Delete(':id')
	@Roles(['admin'])
	delete(@Param('id') id: string) {
		return this.deleteEvent.execute(id)
	}
}
