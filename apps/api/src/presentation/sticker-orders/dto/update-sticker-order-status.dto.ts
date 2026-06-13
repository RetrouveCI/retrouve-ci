import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { STICKER_ORDER_STATUSES } from '@/domains/sticker-orders/constants'
import type { StickerOrderStatus } from '@/domains/sticker-orders/types/sticker-order.types'

export class UpdateStickerOrderStatusDto {
	@ApiProperty({ enum: STICKER_ORDER_STATUSES })
	@IsIn(STICKER_ORDER_STATUSES)
	status!: StickerOrderStatus
}
