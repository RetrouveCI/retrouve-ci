import { InjectQueue } from '@nestjs/bullmq'
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
import { AllowAnonymous, Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Queue } from 'bullmq'
import type { auth } from '@/infrastructure/auth/auth.config'
import { FIND_MATCHES_JOB, MATCHING_QUEUE } from '@/domains/matching/constants'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import { AdminListLostItemsQueryDto } from '../dto/admin-list-lost-items.query.dto'
import { CreateLostItemDto } from '../dto/create-lost-item.dto'
import { ListLostItemsQueryDto } from '../dto/list-lost-items.query.dto'
import { UpdateLostItemDto } from '../dto/update-lost-item.dto'
import { UpdateModerationStatusDto } from '../dto/update-moderation-status.dto'

@ApiTags('lost-items')
@ApiBearerAuth()
@Controller('lost-items')
export class LostItemsController {
	constructor(
		private readonly lostItemUseCases: LostItemUseCases,
		@InjectQueue(MATCHING_QUEUE) private readonly matchingQueue: Queue,
	) {}

	@Post()
	async create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateLostItemDto,
	) {
		const lostItem = await this.lostItemUseCases.create({
			...dto,
			eventDate: new Date(dto.eventDate),
			userId: session.user.id,
		})

		await this.matchingQueue.add(FIND_MATCHES_JOB, {
			lostItemId: lostItem.id,
		})

		return lostItem
	}

	@Get()
	@AllowAnonymous()
	list(@Query() query: ListLostItemsQueryDto) {
		return this.lostItemUseCases.list({
			...query,
			moderationStatus: 'published',
		})
	}

	@Get('mine')
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListLostItemsQueryDto,
	) {
		return this.lostItemUseCases.listMine(session.user.id, query)
	}

	@Get('admin')
	@Roles(['admin'])
	listForAdmin(@Query() query: AdminListLostItemsQueryDto) {
		return this.lostItemUseCases.list(query)
	}

	@Patch(':id/moderation')
	@Roles(['admin'])
	updateModerationStatus(
		@Param('id') id: string,
		@Body() dto: UpdateModerationStatusDto,
	) {
		return this.lostItemUseCases.moderate(id, dto.moderationStatus)
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
