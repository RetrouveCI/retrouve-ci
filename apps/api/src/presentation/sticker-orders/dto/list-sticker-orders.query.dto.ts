import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	STICKER_ORDER_STATUSES,
} from '@/domains/sticker-orders/constants'
import type { StickerOrderStatus } from '@/domains/sticker-orders/types/sticker-order.types'

export class ListStickerOrdersQueryDto {
	@ApiPropertyOptional({ enum: STICKER_ORDER_STATUSES })
	@IsOptional()
	@IsIn(STICKER_ORDER_STATUSES)
	status?: StickerOrderStatus

	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1

	@ApiPropertyOptional({
		minimum: 1,
		maximum: MAX_PAGE_SIZE,
		default: DEFAULT_PAGE_SIZE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PAGE_SIZE)
	pageSize: number = DEFAULT_PAGE_SIZE
}
