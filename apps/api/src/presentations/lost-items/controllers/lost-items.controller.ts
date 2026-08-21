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
import {
	adminListLostItemsFilterSchema,
	createLostItemSchema,
	listLostItemsFilterSchema,
	updateLostItemSchema,
	updateModerationStatusSchema,
	type AdminListLostItemsFilterData,
	type CreateLostItemData,
	type ListLostItemsFilterData,
	type UpdateLostItemData,
	type UpdateModerationStatusData,
} from '@app/contracts/lost-items'
import { AllowAnonymous, Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Queue } from 'bullmq'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { FIND_MATCHES_JOB, MATCHING_QUEUE } from '@/domains/matching/constants'
import { LostItemUseCases } from '@/domains/lost-items/use-cases/lost-item.use-cases'
import type { ListLostItemsFilter } from '@/domains/lost-items/types/lost-item.types'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('lost-items')
@ApiBearerAuth()
@Controller('lost-items')
export class LostItemsController {
	constructor(
		private readonly lostItemUseCases: LostItemUseCases,
		@InjectQueue(MATCHING_QUEUE) private readonly matchingQueue: Queue,
	) {}

	@Post()
	@ApiZodBody(createLostItemSchema)
	async create(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(createLostItemSchema)) data: CreateLostItemData,
	) {
		const lostItem = await this.lostItemUseCases.create({
			...data,
			eventDate: new Date(data.eventDate),
			userId: session.user.id,
		})

		await this.matchingQueue.add(FIND_MATCHES_JOB, {
			lostItemId: lostItem.id,
		})

		return lostItem
	}

	@Get()
	@AllowAnonymous()
	@ApiZodQuery(listLostItemsFilterSchema)
	list(
		@Query(new ZodValidationPipe(listLostItemsFilterSchema))
		filter: ListLostItemsFilterData,
	) {
		return this.lostItemUseCases.list({
			...this.toListFilter(filter),
			moderationStatus: 'published',
		})
	}

	@Get('mine')
	@ApiZodQuery(listLostItemsFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listLostItemsFilterSchema))
		filter: ListLostItemsFilterData,
	) {
		return this.lostItemUseCases.listMine(
			session.user.id,
			this.toListFilter(filter),
		)
	}

	private toListFilter(
		filter: AdminListLostItemsFilterData,
	): ListLostItemsFilter {
		const { dateFrom, dateTo, ...rest } = filter

		return {
			...rest,
			...(dateFrom && {
				dateFrom: new Date(`${dateFrom.slice(0, 10)}T00:00:00.000Z`),
			}),
			...(dateTo && {
				dateTo: new Date(`${dateTo.slice(0, 10)}T23:59:59.999Z`),
			}),
		}
	}

	@Get('admin')
	@Roles(['admin'])
	@ApiZodQuery(adminListLostItemsFilterSchema)
	listForAdmin(
		@Query(new ZodValidationPipe(adminListLostItemsFilterSchema))
		filter: AdminListLostItemsFilterData,
	) {
		return this.lostItemUseCases.list(this.toListFilter(filter))
	}

	@Patch(':id/moderation')
	@Roles(['admin'])
	@ApiZodBody(updateModerationStatusSchema)
	updateModerationStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateModerationStatusSchema))
		data: UpdateModerationStatusData,
	) {
		return this.lostItemUseCases.moderate(id, data.moderationStatus)
	}

	@Get(':id')
	@AllowAnonymous()
	getOne(@Param('id') id: string) {
		return this.lostItemUseCases.getById(id)
	}

	@Post(':id/contact')
	@AllowAnonymous()
	recordContact(@Param('id') id: string) {
		return this.lostItemUseCases.recordContact(id)
	}

	@Patch(':id')
	@ApiZodBody(updateLostItemSchema)
	update(
		@Session() session: UserSession<Auth>,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateLostItemSchema)) data: UpdateLostItemData,
	) {
		const { eventDate, ...rest } = data

		return this.lostItemUseCases.update(id, session.user.id, {
			...rest,
			...(eventDate && { eventDate: new Date(eventDate) }),
		})
	}

	@Delete(':id')
	delete(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.lostItemUseCases.delete(id, session.user.id)
	}
}
