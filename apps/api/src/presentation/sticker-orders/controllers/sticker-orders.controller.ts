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
	createStickerOrderSchema,
	listStickerOrdersFilterSchema,
	updateStickerOrderStatusSchema,
	type CreateStickerOrderData,
	type ListStickerOrdersFilterData,
	type UpdateStickerOrderStatusData,
} from '@app/contracts/sticker-orders'
import { Roles, Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { Auth } from '@/infrastructure/auth/auth.config'
import { StickerOrderUseCases } from '@/domains/sticker-orders/use-cases/sticker-order.use-cases'
import { ZodValidationPipe } from '@/shared/pipes/zod-validation.pipe'

@ApiTags('sticker-orders')
@ApiBearerAuth()
@Controller('sticker-orders')
export class StickerOrdersController {
	constructor(private readonly stickerOrderUseCases: StickerOrderUseCases) {}

	@Post()
	create(
		@Session() session: UserSession<Auth>,
		@Body(new ZodValidationPipe(createStickerOrderSchema))
		data: CreateStickerOrderData,
	) {
		return this.stickerOrderUseCases.create({
			...data,
			userId: session.user.id,
		})
	}

	@Get()
	@Roles(['admin'])
	list(
		@Query(new ZodValidationPipe(listStickerOrdersFilterSchema))
		filter: ListStickerOrdersFilterData,
	) {
		return this.stickerOrderUseCases.list(filter)
	}

	@Get('mine')
	listMine(
		@Session() session: UserSession<Auth>,
		@Query(new ZodValidationPipe(listStickerOrdersFilterSchema))
		filter: ListStickerOrdersFilterData,
	) {
		return this.stickerOrderUseCases.listMine(session.user.id, filter)
	}

	@Get(':id')
	getOne(@Session() session: UserSession<Auth>, @Param('id') id: string) {
		return this.stickerOrderUseCases.getOne(id, session.user.id)
	}

	@Patch(':id/status')
	@Roles(['admin'])
	updateStatus(
		@Param('id') id: string,
		@Body(new ZodValidationPipe(updateStickerOrderStatusSchema))
		data: UpdateStickerOrderStatusData,
	) {
		return this.stickerOrderUseCases.updateStatus(id, data.status)
	}
}
