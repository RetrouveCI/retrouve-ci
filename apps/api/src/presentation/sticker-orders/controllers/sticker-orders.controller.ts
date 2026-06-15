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
import { Session } from '@thallesp/nestjs-better-auth'
import type { UserSession } from '@thallesp/nestjs-better-auth'
import type { auth } from '@/infrastructure/auth/auth.config'
import { StickerOrderUseCases } from '@/domains/sticker-orders/use-cases/sticker-order.use-cases'
import { CreateStickerOrderDto } from '../dto/create-sticker-order.dto'
import { ListStickerOrdersQueryDto } from '../dto/list-sticker-orders.query.dto'
import { UpdateStickerOrderStatusDto } from '../dto/update-sticker-order-status.dto'

@ApiTags('sticker-orders')
@ApiBearerAuth()
@Controller('sticker-orders')
export class StickerOrdersController {
	constructor(private readonly stickerOrderUseCases: StickerOrderUseCases) {}

	@Post()
	create(
		@Session() session: UserSession<typeof auth>,
		@Body() dto: CreateStickerOrderDto,
	) {
		return this.stickerOrderUseCases.create({
			...dto,
			userId: session.user.id,
		})
	}

	@Get()
	list(@Query() query: ListStickerOrdersQueryDto) {
		return this.stickerOrderUseCases.list(query)
	}

	@Get('mine')
	listMine(
		@Session() session: UserSession<typeof auth>,
		@Query() query: ListStickerOrdersQueryDto,
	) {
		return this.stickerOrderUseCases.listMine(session.user.id, query)
	}

	@Get(':id')
	getOne(
		@Session() session: UserSession<typeof auth>,
		@Param('id') id: string,
	) {
		return this.stickerOrderUseCases.getOne(id, session.user.id)
	}

	@Patch(':id/status')
	updateStatus(
		@Param('id') id: string,
		@Body() dto: UpdateStickerOrderStatusDto,
	) {
		return this.stickerOrderUseCases.updateStatus(id, dto.status)
	}
}
