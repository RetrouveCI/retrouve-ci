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
import { AllowAnonymous, Roles } from '@thallesp/nestjs-better-auth'
import { EventUseCases } from '@/domains/events/use-cases/event.use-cases'
import { AdminListEventsQueryDto } from '../dto/admin-list-events.query.dto'
import { CreateEventDto } from '../dto/create-event.dto'
import { ListEventsQueryDto } from '../dto/list-events.query.dto'
import { UpdateEventDto } from '../dto/update-event.dto'

@ApiTags('events')
@ApiBearerAuth()
@Controller('events')
export class EventsController {
	constructor(private readonly eventUseCases: EventUseCases) {}

	@Post()
	@Roles(['admin'])
	create(@Body() dto: CreateEventDto) {
		return this.eventUseCases.create({
			...dto,
			eventDate: new Date(dto.eventDate),
		})
	}

	@Get()
	@AllowAnonymous()
	list(@Query() query: ListEventsQueryDto) {
		return this.eventUseCases.list({ ...query, status: 'published' })
	}

	@Get('admin')
	@Roles(['admin'])
	listForAdmin(@Query() query: AdminListEventsQueryDto) {
		return this.eventUseCases.list(query)
	}

	@Get(':id')
	@AllowAnonymous()
	getOne(@Param('id') id: string) {
		return this.eventUseCases.getById(id)
	}

	@Patch(':id')
	@Roles(['admin'])
	update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
		const { eventDate, ...rest } = dto

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
