import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { STICKER_PACK_IDS } from '@/domains/sticker-orders/constants'

export class CreateStickerOrderDto {
	@ApiProperty({ enum: STICKER_PACK_IDS })
	@IsIn(STICKER_PACK_IDS)
	packId!: string

	@ApiProperty({ minLength: 2, maxLength: 60 })
	@IsString()
	@MinLength(2)
	@MaxLength(60)
	paymentMethod!: string

	@ApiProperty({ minLength: 5, maxLength: 200 })
	@IsString()
	@MinLength(5)
	@MaxLength(200)
	deliveryAddress!: string

	@ApiProperty({ minLength: 2, maxLength: 120 })
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	deliveryCity!: string

	@ApiPropertyOptional({ maxLength: 500 })
	@IsOptional()
	@IsString()
	@MaxLength(500)
	deliveryNotes?: string

	@ApiPropertyOptional({ maxLength: 30 })
	@IsOptional()
	@IsString()
	@MaxLength(30)
	couponCode?: string
}
