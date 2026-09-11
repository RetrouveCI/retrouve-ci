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
	batchModerateLostItemsSchema,
	createLostItemSchema,
	createOfficialLostItemSchema,
	listLostItemsFilterSchema,
	myLostItemsFilterSchema,
	updateLostItemSchema,
	updateModerationStatusSchema,
	type AdminListLostItemsFilterData,
	type BatchModerateLostItemsData,
	type CreateLostItemData,
	type CreateOfficialLostItemData,
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
import { CreateOfficialLostItemUseCase } from '@/domains/lost-items/use-cases/create-official-lost-item.use-case'
import { DeleteLostItemUseCase } from '@/domains/lost-items/use-cases/delete-lost-item.use-case'
import { GetMyLostItemsSummaryUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items-summary.use-case'
import { GetLostItemForDeskUseCase } from '@/domains/lost-items/use-cases/get-lost-item-for-desk.use-case'
import { GetMyLostItemsUseCase } from '@/domains/lost-items/use-cases/get-my-lost-items.use-case'
import { GetPaginatedLostItemsUseCase } from '@/domains/lost-items/use-cases/get-paginated-lost-items.use-case'
import { GetPublicLostItemsUseCase } from '@/domains/lost-items/use-cases/get-public-lost-items.use-case'
import { ModerateLostItemUseCase } from '@/domains/lost-items/use-cases/moderate-lost-item.use-case'
import { ContactLostItemPosterUseCase } from '@/domains/lost-items/use-cases/contact-lost-item-poster.use-case'
import { UpdateLostItemUseCase } from '@/domains/lost-items/use-cases/update-lost-item.use-case'
import { ViewLostItemUseCase } from '@/domains/lost-items/use-cases/view-lost-item.use-case'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { settleBatch } from '@/shared/utils/batch.util'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'
import { MatchingDispatcher } from '@/infrastructures/queue/matching-dispatcher.service'
import { AccountBudget } from '@/shared/rate-limit/account-budget.service'
import { LOST_ITEM_PER_USER } from '@/shared/rate-limit/rate-limit.policy'

@ApiTags('lost-items')
@ApiBearerAuth()
@Controller('lost-items')
export class LostItemsController {
	constructor(
		private readonly createLostItemUseCase: CreateLostItemUseCase,
		private readonly createOfficialLostItemUseCase: CreateOfficialLostItemUseCase,
		private readonly viewLostItemUseCase: ViewLostItemUseCase,
		private readonly getLostItemForDeskUseCase: GetLostItemForDeskUseCase,
		private readonly contactLostItemPosterUseCase: ContactLostItemPosterUseCase,
		private readonly getPaginatedLostItemsUseCase: GetPaginatedLostItemsUseCase,
		private readonly getPublicLostItemsUseCase: GetPublicLostItemsUseCase,
		private readonly getMyLostItemsUseCase: GetMyLostItemsUseCase,
		private readonly getMyLostItemsSummaryUseCase: GetMyLostItemsSummaryUseCase,
		private readonly updateLostItemUseCase: UpdateLostItemUseCase,
		private readonly moderateLostItemUseCase: ModerateLostItemUseCase,
		private readonly deleteLostItemUseCase: DeleteLostItemUseCase,
		private readonly matchingDispatcher: MatchingDispatcher,
		private readonly accountBudget: AccountBudget,
	) {}

	@Post()
	@ApiZodBody(createLostItemSchema)
	async create(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(createLostItemSchema)) data: CreateLostItemData,
	) {
		// What a flood of listings spends is the moderation queue, so the ceiling
		// is checked before the row is written.
		await this.accountBudget.require(LOST_ITEM_PER_USER, session.user.id)

		return this.createLostItemUseCase.execute({
			...data,
			eventDate: new Date(data.eventDate),
			userId: session.user.id,
		})
	}

	/**
	 * The team's own publication. Admin-only, and it is the one write that comes
	 * out `published`: an operator filing a listing at the desk is the moderation
	 * decision. No `AccountBudget` ceiling — that one bounds a flood of visitor
	 * listings by spending the moderation queue, which this route does not use;
	 * what bounds this one is `@Roles`.
	 */
	@Post('official')
	@Roles(['admin'])
	@ApiZodBody(createOfficialLostItemSchema)
	async createOfficial(
		@Body(new ZodValidationPipe(createOfficialLostItemSchema))
		data: CreateOfficialLostItemData,
	) {
		const lostItem = await this.createOfficialLostItemUseCase.execute({
			...data,
			eventDate: new Date(data.eventDate),
		})

		// Born published, and publication is the only moment matching runs.
		await this.matchingDispatcher.dispatch(lostItem.id)

		return lostItem
	}

	@Get()
	@AllowAnonymous()
	@ApiZodQuery(listLostItemsFilterSchema)
	list(
		@Query(new ZodValidationPipe(listLostItemsFilterSchema))
		filter: ListLostItemsFilterData,
	) {
		return this.getPublicLostItemsUseCase.execute(this.toListFilter(filter))
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

	/**
	 * The counts « Mes annonces » puts on its filter pills and in its moderation
	 * banner. They are deliberately unfiltered: a pill says how many the visitor
	 * owns in that bucket, and an exception must not be hidden by a search.
	 */
	@Get('mine/summary')
	listMineSummary(@Session() session: UserSession<Auth>) {
		return this.getMyLostItemsSummaryUseCase.execute(session.user.id)
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

	// The desk's own read: `:id` hides an unpublished listing from everyone but
	// its author, administrators included — and that is the one it moderates.
	@Get('admin/:id')
	@Roles(['admin'])
	getOneForDesk(@Param('id') id: string) {
		return this.getLostItemForDeskUseCase.execute(id)
	}

	@Patch(':id/moderation')
	@Roles(['admin'])
	@ApiZodBody(updateModerationStatusSchema)
	async updateModerationStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateModerationStatusSchema))
		data: UpdateModerationStatusData,
	) {
		const { lostItem, becamePublished } =
			await this.moderateLostItemUseCase.execute({ id, ...data })

		// Publication is the only moment a listing becomes matchable — the
		// transition, not the state, so publishing twice searches once.
		if (becamePublished) {
			await this.matchingDispatcher.dispatch(id)
		}

		return lostItem
	}

	/**
	 * Publishing a selection, one listing at a time through the same use-case as
	 * the single decision — which is what keeps the guarantee that a listing
	 * already published notifies nobody and is not searched again. A row that
	 * refuses leaves the others alone, and the answer names it.
	 */
	@Patch('moderation/batch')
	@Roles(['admin'])
	@ApiZodBody(batchModerateLostItemsSchema)
	async moderateBatch(
		@Body(new ZodValidationPipe(batchModerateLostItemsSchema))
		{ ids, moderationStatus }: BatchModerateLostItemsData,
	) {
		return settleBatch(ids, async id => {
			const { becamePublished } = await this.moderateLostItemUseCase.execute({
				id,
				moderationStatus,
			})

			if (becamePublished) await this.matchingDispatcher.dispatch(id)
		})
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

	// Answers a target the front turns into a `Location`, and already capped.
	@Post(':id/contact')
	@AllowAnonymous()
	contactPoster(@Param('id') id: string) {
		return this.contactLostItemPosterUseCase.execute(id)
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
