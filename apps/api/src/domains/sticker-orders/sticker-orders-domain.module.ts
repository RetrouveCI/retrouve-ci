import { Module } from '@nestjs/common'
import { StickerOrderRepository } from './repository/sticker-order.repository'
import { CreateStickerOrderUseCase } from './use-cases/create-sticker-order.use-case'
import { GetMyStickerOrdersUseCase } from './use-cases/get-my-sticker-orders.use-case'
import { GetPaginatedStickerOrdersUseCase } from './use-cases/get-paginated-sticker-orders.use-case'
import { GetStickerOrderUseCase } from './use-cases/get-sticker-order.use-case'
import { UpdateStickerOrderStatusUseCase } from './use-cases/update-sticker-order-status.use-case'

const providers = [
	StickerOrderRepository,
	CreateStickerOrderUseCase,
	GetStickerOrderUseCase,
	GetPaginatedStickerOrdersUseCase,
	GetMyStickerOrdersUseCase,
	UpdateStickerOrderStatusUseCase,
]

@Module({
	providers,
	exports: providers,
})
export class StickerOrdersDomainModule {}
