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
	@IsIn(LOST_ITEM_TYPES)
	type!: LostItemType

	@IsIn(LOST_ITEM_CATEGORIES)
	category!: LostItemCategory

	@IsString()
	@MinLength(3)
	@MaxLength(120)
	title!: string

	@IsString()
	@MinLength(MIN_DESCRIPTION_LENGTH)
	@MaxLength(2000)
	description!: string

	@IsString()
	@MinLength(2)
	@MaxLength(120)
	ville!: string

	@IsOptional()
	@IsString()
	@MaxLength(120)
	commune?: string

	@IsDateString()
	eventDate!: string

	@IsString()
	@MinLength(2)
	@MaxLength(120)
	contactName!: string

	@IsString()
	@MinLength(8)
	@MaxLength(20)
	contactWhatsapp!: string

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(MAX_PHOTOS)
	@IsString({ each: true })
	photos?: string[]
}
