import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	IsDateString,
	IsIn,
	IsInt,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator'
import {
	DEFAULT_PAGE_SIZE,
	LOST_ITEM_CATEGORIES,
	LOST_ITEM_TYPES,
	MAX_PAGE_SIZE,
} from '@/domains/lost-items/constants'
import type {
	LostItemCategory,
	LostItemType,
} from '@/domains/lost-items/types/lost-item.types'

export class ListLostItemsQueryDto {
	@ApiPropertyOptional({ enum: LOST_ITEM_TYPES })
	@IsOptional()
	@IsIn(LOST_ITEM_TYPES)
	type?: LostItemType

	@ApiPropertyOptional({ enum: LOST_ITEM_CATEGORIES })
	@IsOptional()
	@IsIn(LOST_ITEM_CATEGORIES)
	category?: LostItemCategory

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	ville?: string

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	commune?: string

	@ApiPropertyOptional({
		description: 'Recherche textuelle dans le titre et la description',
	})
	@IsOptional()
	@IsString()
	search?: string

	@ApiPropertyOptional({ description: 'Date de début (ISO 8601)' })
	@IsOptional()
	@IsDateString()
	dateFrom?: string

	@ApiPropertyOptional({ description: 'Date de fin (ISO 8601)' })
	@IsOptional()
	@IsDateString()
	dateTo?: string

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
