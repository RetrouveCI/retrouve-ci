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
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { auth } from '@/infrastructure/auth/auth.config'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import { CreateLostItemDto } from '../dto/create-lost-item.dto'
import { ListLostItemsQueryDto } from '../dto/list-lost-items.query.dto'
import { UpdateLostItemDto } from '../dto/update-lost-item.dto'

@ApiTags('lost-items')
@ApiBearerAuth()
@Controller('lost-items')
export class LostItemsController {
	constructor(private readonly lostItemUseCases: LostItemUseCases) {}

	@Post()
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateLostItemDto,
	) {
		return this.lostItemUseCases.create({
			...dto,
			eventDate: new Date(dto.eventDate),
			userId: session.user.id,
		})
	}

	@Get()
	@AllowAnonymous()
	list(@Query() query: ListLostItemsQueryDto) {
		return this.lostItemUseCases.list(query)
	}

	@Get('mine')
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListLostItemsQueryDto,
	) {
		return this.lostItemUseCases.listMine(session.user.id, query)
	}

	@Get(':id')
	@AllowAnonymous()
	getOne(@Param('id') id: string) {
		return this.lostItemUseCases.view(id)
	}

	@Post(':id/contact')
	@AllowAnonymous()
	recordContact(@Param('id') id: string) {
		return this.lostItemUseCases.recordContact(id)
	}

	@Patch(':id')
	update(
		@Session() session: UserSession<typeof auth>,
		@Param('id') id: string,
		@Body() dto: UpdateLostItemDto,
	) {
		const { eventDate, ...rest } = dto

		return this.lostItemUseCases.update(id, session.user.id, {
			...rest,
			...(eventDate && { eventDate: new Date(eventDate) }),
		})
	}

	@Delete(':id')
	delete(
		@Session() session: UserSession<typeof auth>,
		@Param('id') id: string,
	) {
		return this.lostItemUseCases.delete(id, session.user.id)
	}
}
