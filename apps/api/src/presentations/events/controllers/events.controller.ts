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
import { EventUseCases } from '@/domains/events/use-cases/event.use-cases'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
	constructor(private readonly eventUseCases: EventUseCases) {}

	@Post()
	@Roles(['admin'])
	@ApiZodBody(createEventSchema)
	create(
		@Body(new ZodValidationPipe(createEventSchema)) data: CreateEventData,
	) {
		return this.eventUseCases.create({
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
		return this.eventUseCases.list({ ...filter, status: 'published' })
	}

	@Get('admin')
	@Roles(['admin'])
	@ApiZodQuery(adminListEventsFilterSchema)
	listForAdmin(
		@Query(new ZodValidationPipe(adminListEventsFilterSchema))
		filter: AdminListEventsFilterData,
	) {
		return this.eventUseCases.list(filter)
	}

	@Get(':id')
	@AllowAnonymous()
	getOne(@Param('id') id: string) {
		return this.eventUseCases.getById(id)
	}

	@Patch(':id')
	@Roles(['admin'])
	@ApiZodBody(updateEventSchema)
	update(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateEventSchema)) data: UpdateEventData,
	) {
		const { eventDate, ...rest } = data

		return this.eventUseCases.update(id, {
			...rest,
			...(eventDate && { eventDate: new Date(eventDate) }),
		})
	}

	@Delete(':id')
	@Roles(['admin'])
	delete(@Param('id') id: string) {
		return this.eventUseCases.delete(id)
	}
}
