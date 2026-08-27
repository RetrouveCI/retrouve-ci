import { Module } from '@nestjs/common'
import { StickerOrdersDomainModule } from '@/domains/sticker-orders/sticker-orders-domain.module'
import { StickerOrdersController } from './sticker-orders.controller'

@Module({
	imports: [StickerOrdersDomainModule],
	controllers: [StickerOrdersController],
})
export class StickerOrdersModule {}
