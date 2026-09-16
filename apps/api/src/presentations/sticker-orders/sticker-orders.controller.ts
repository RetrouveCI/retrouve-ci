import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import {
	batchUpdateStickerOrderStatusSchema,
	createStickerOrderSchema,
	listStickerOrdersFilterSchema,
	updateStickerOrderStatusSchema,
	type BatchUpdateStickerOrderStatusData,
	type CreateStickerOrderData,
	type ListStickerOrdersFilterData,
	type UpdateStickerOrderStatusData,
} from '@app/contracts/sticker-orders'
import { Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructures/auth/auth.config'
import { CreateStickerOrderUseCase } from '@/domains/sticker-orders/use-cases/create-sticker-order.use-case'
import { GetMyStickerOrdersUseCase } from '@/domains/sticker-orders/use-cases/get-my-sticker-orders.use-case'
import { GetPaginatedStickerOrdersUseCase } from '@/domains/sticker-orders/use-cases/get-paginated-sticker-orders.use-case'
import { GetStickerOrderForDeskUseCase } from '@/domains/sticker-orders/use-cases/get-sticker-order-for-desk.use-case'
import { GetStickerOrderUseCase } from '@/domains/sticker-orders/use-cases/get-sticker-order.use-case'
import { UpdateStickerOrderStatusUseCase } from '@/domains/sticker-orders/use-cases/update-sticker-order-status.use-case'
import type { ListStickerOrdersFilter } from '@/domains/sticker-orders/types/sticker-order.types'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'
import { toDateRange } from '@/shared/utils/date-range.util'
import { settleBatch } from '@/shared/utils/batch.util'
import { ApiZodBody, ApiZodQuery } from '@/shared/swagger/api-zod.decorator'

@ApiTags('sticker-orders')
@ApiBearerAuth()
@Controller('sticker-orders')
export class StickerOrdersController {
	constructor(
		private readonly createStickerOrderUseCase: CreateStickerOrderUseCase,
		private readonly getStickerOrderUseCase: GetStickerOrderUseCase,
		private readonly getPaginatedStickerOrdersUseCase: GetPaginatedStickerOrdersUseCase,
		private readonly getMyStickerOrdersUseCase: GetMyStickerOrdersUseCase,
		private readonly updateStickerOrderStatusUseCase: UpdateStickerOrderStatusUseCase,
		private readonly getStickerOrderForDeskUseCase: GetStickerOrderForDeskUseCase,
	) {}

	@Post()
	@ApiZodBody(createStickerOrderSchema)
	create(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(createStickerOrderSchema))
		data: CreateStickerOrderData,
	) {
		return this.createStickerOrderUseCase.execute({
			...data,
			userId: session.user.id,
		})
	}

	/**
	 * The two calendar bounds become instants here, and the upper one closes its
	 * day: a raw `lte` on `2026-09-15` would drop the whole of the 15th, and the
	 * list would be incomplete rather than empty — the kind of wrong nobody
	 * reports. Both list routes go through it.
	 */
	private toListFilter(
		filter: ListStickerOrdersFilterData,
	): ListStickerOrdersFilter {
		const { dateFrom, dateTo, ...rest } = filter

		return { ...rest, ...toDateRange({ dateFrom, dateTo }) }
	}

	@Get()
	@Roles(['admin'])
	@ApiZodQuery(listStickerOrdersFilterSchema)
	list(
		@Query(new ZodValidationPipe(listStickerOrdersFilterSchema))
		filter: ListStickerOrdersFilterData,
	) {
		return this.getPaginatedStickerOrdersUseCase.execute(
			this.toListFilter(filter),
		)
	}

	@Get('mine')
	@ApiZodQuery(listStickerOrdersFilterSchema)
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listStickerOrdersFilterSchema))
		filter: ListStickerOrdersFilterData,
	) {
		return this.getMyStickerOrdersUseCase.execute({
			userId: session.user.id,
			filter: this.toListFilter(filter),
		})
	}

	@Get(':id')
	getOne(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.getStickerOrderUseCase.execute({ id, userId: session.user.id })
	}

	// The desk's own read: `:id` answers the buyer alone, administrators included.
	@Get('admin/:id')
	@Roles(['admin'])
	getOneForDesk(@Param('id') id: string) {
		return this.getStickerOrderForDeskUseCase.execute(id)
	}

	/**
	 * ⚠️ Moving a selection forward, one order at a time through the same
	 * use-case — which is what keeps each buyer's notice right, and keeps an
	 * order already in that status silent. The contract refuses `cancelled`
	 * here: a cancellation is one order's decision, behind its confirmation.
	 */
	@Patch('status/batch')
	@Roles(['admin'])
	@ApiZodBody(batchUpdateStickerOrderStatusSchema)
	async updateStatusBatch(
		@Body(new ZodValidationPipe(batchUpdateStickerOrderStatusSchema))
		{ ids, status }: BatchUpdateStickerOrderStatusData,
	) {
		return settleBatch(ids, id =>
			this.updateStickerOrderStatusUseCase.execute({ id, status }),
		)
	}

	@Patch(':id/status')
	@Roles(['admin'])
	@ApiZodBody(updateStickerOrderStatusSchema)
	updateStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateStickerOrderStatusSchema))
		data: UpdateStickerOrderStatusData,
	) {
		return this.updateStickerOrderStatusUseCase.execute({
			id,
			status: data.status,
		})
	}
}
