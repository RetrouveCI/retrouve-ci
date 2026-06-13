import { Module } from '@nestjs/common'
import { STICKER_ORDER_REPOSITORY } from '@/domains/sticker-orders/repository/sticker-order.repository'
import { StickerOrderRepositoryService } from '@/domains/sticker-orders/repository/sticker-order.repository.service'
import { StickerOrderUseCases } from '@/domains/sticker-orders/use-cases/sticker-order.use-cases'
import { StickerOrdersController } from './controllers/sticker-orders.controller'

@Module({
	controllers: [StickerOrdersController],
	providers: [
		StickerOrderUseCases,
		{
			provide: STICKER_ORDER_REPOSITORY,
			useClass: StickerOrderRepositoryService,
		},
	],
})
export class StickerOrdersModule {}
