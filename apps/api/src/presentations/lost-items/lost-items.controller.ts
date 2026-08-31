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
	myLostItemsFilterSchema,
	updateLostItemSchema,
	updateModerationStatusSchema,
	type AdminListLostItemsFilterData,
	type CreateLostItemData,
	type ListLostItemsFilterData,
	type MyLostItemsFilterData,
	type UpdateLostItemData,
	type UpdateModerationStatusData,
} from '@app/contracts/lost-items'
import {
	AllowAnonymous,
	OptionalAuth,
	Roles,
	Session,
} from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import type { ListLostItemsFilter } from '@/domains/lost-items/types/lost-item.types'
import { CreateLostItemUseCase } from '@/domains/lost-items/use-cases/create-lost-item.use-case'
import { DeleteLostItemUseCase } from '@/domains/lost-items/use-cases/delete-lost-item.use-case'
import { GetMyLostItemsUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items.use-case'
import { GetPaginatedLostItemsUseCase } from '@/domains/lost-items/use-cases/get-paginated-lost-items.use-case'
import { ModerateLostItemUseCase } from '@/domains/lost-items/use-cases/moderate-lost-item.use-case'
import { RecordLostItemContactUseCase } from '@/domains/lost-items/use-cases/record-lost-item-contact.use-case'
import { UpdateLostItemUseCase } from '@/domains/lost-items/use-cases/update-lost-item.use-case'
import { ViewLostItemUseCase } from '@/domains/lost-items/use-cases/view-lost-item.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'
import { MatchingDispatcher } from '@/infrastructures/queue/matching-dispatcher.service'

@ApiTags('lost-items')
@ApiBearerAuth()
@Controller('lost-items')
export class LostItemsController {
	constructor(
		private readonly createLostItemUseCase: CreateLostItemUseCase,
		private readonly viewLostItemUseCase: ViewLostItemUseCase,
		private readonly recordLostItemContactUseCase: RecordLostItemContactUseCase,
		private readonly getPaginatedLostItemsUseCase: GetPaginatedLostItemsUseCase,
		private readonly getMyLostItemsUseCase: GetMyLostItemsUseCase,
		private readonly updateLostItemUseCase: UpdateLostItemUseCase,
		private readonly moderateLostItemUseCase: ModerateLostItemUseCase,
		private readonly deleteLostItemUseCase: DeleteLostItemUseCase,
		private readonly matchingDispatcher: MatchingDispatcher,
	) {}

	@Post()
	@ApiZodBody(createLostItemSchema)
	create(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(createLostItemSchema)) data: CreateLostItemData,
	) {
		return this.createLostItemUseCase.execute({
			...data,
			eventDate: new Date(data.eventDate),
			userId: session.user.id,
		})
	}

	@Get()
	@AllowAnonymous()
	@ApiZodQuery(listLostItemsFilterSchema)
	list(
		@Query(new ZodValidationPipe(listLostItemsFilterSchema))
		filter: ListLostItemsFilterData,
	) {
		return this.getPaginatedLostItemsUseCase.execute({
			...this.toListFilter(filter),
			moderationStatus: 'published',
		})
	}

	@Get('mine')
	@ApiZodQuery(myLostItemsFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(myLostItemsFilterSchema))
		filter: MyLostItemsFilterData,
	) {
		return this.getMyLostItemsUseCase.execute({
			userId: session.user.id,
			filter: this.toListFilter(filter),
		})
	}

	/** Both audiences' extra axis, so one translation serves the three routes. */
	private toListFilter(
		filter: AdminListLostItemsFilterData & MyLostItemsFilterData,
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
		return this.getPaginatedLostItemsUseCase.execute(this.toListFilter(filter))
	}

	@Patch(':id/moderation')
	@Roles(['admin'])
	@ApiZodBody(updateModerationStatusSchema)
	async updateModerationStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateModerationStatusSchema))
		data: UpdateModerationStatusData,
	) {
		const lostItem = await this.moderateLostItemUseCase.execute({
			id,
			moderationStatus: data.moderationStatus,
		})

		/** Publication is the only moment a listing becomes matchable. */
		if (lostItem.moderationStatus === 'published') {
			await this.matchingDispatcher.dispatch(id)
		}

		return lostItem
	}

	@Get(':id')
	@OptionalAuth()
	getOne(
		@Session() session: UserSession<Auth> | null,
		@Param('id') id: string,
	) {
		return this.viewLostItemUseCase.execute({
			id,
			viewerId: session?.user.id,
		})
	}

	@Post(':id/contact')
	@AllowAnonymous()
	recordContact(@Param('id') id: string) {
		return this.recordLostItemContactUseCase.execute(id)
	}

	@Patch(':id')
	@ApiZodBody(updateLostItemSchema)
	update(
		@Session() session: UserSession<Auth>,
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateLostItemSchema)) data: UpdateLostItemData,
	) {
		const { eventDate, ...rest } = data

		return this.updateLostItemUseCase.execute({
			id,
			userId: session.user.id,
			data: {
				...rest,
				...(eventDate && { eventDate: new Date(eventDate) }),
			},
		})
	}

	@Delete(':id')
	delete(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.deleteLostItemUseCase.execute({ id, userId: session.user.id })
	}
}
