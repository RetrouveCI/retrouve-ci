import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	ArrayMaxSize,
	IsArray,
	IsDateString,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'
import {
	LOST_ITEM_CATEGORIES,
	LOST_ITEM_TYPES,
	MAX_PHOTOS,
	MIN_DESCRIPTION_LENGTH,
} from '@/domains/lost-items/constants'
import type {
	LostItemCategory,
	LostItemType,
} from '@/domains/lost-items/types/lost-item.types'

export class CreateLostItemDto {
	@ApiProperty({ enum: LOST_ITEM_TYPES })
	@IsIn(LOST_ITEM_TYPES)
	type!: LostItemType

	@ApiProperty({ enum: LOST_ITEM_CATEGORIES })
	@IsIn(LOST_ITEM_CATEGORIES)
	category!: LostItemCategory

	@ApiProperty({ minLength: 3, maxLength: 120 })
	@IsString()
	@MinLength(3)
	@MaxLength(120)
	title!: string

	@ApiProperty({ minLength: MIN_DESCRIPTION_LENGTH, maxLength: 2000 })
	@IsString()
	@MinLength(MIN_DESCRIPTION_LENGTH)
	@MaxLength(2000)
	description!: string

	@ApiProperty({ minLength: 2, maxLength: 120 })
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	ville!: string

	@ApiPropertyOptional({ maxLength: 120 })
	@IsOptional()
	@IsString()
	@MaxLength(120)
	commune?: string

	@ApiProperty({ format: 'date-time' })
	@IsDateString()
	eventDate!: string

	@ApiProperty({ minLength: 2, maxLength: 120 })
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	contactName!: string

	@ApiProperty({ minLength: 8, maxLength: 20 })
	@IsString()
	@MinLength(8)
	@MaxLength(20)
	contactWhatsapp!: string

	@ApiPropertyOptional({ type: [String], maxItems: MAX_PHOTOS })
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(MAX_PHOTOS)
	@IsString({ each: true })
	photos?: string[]
}
