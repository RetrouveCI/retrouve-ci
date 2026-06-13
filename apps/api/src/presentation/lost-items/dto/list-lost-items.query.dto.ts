import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
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
	@IsOptional()
	@IsIn(LOST_ITEM_TYPES)
	type?: LostItemType

	@IsOptional()
	@IsIn(LOST_ITEM_CATEGORIES)
	category?: LostItemCategory

	@IsOptional()
	@IsString()
	ville?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PAGE_SIZE)
	pageSize: number = DEFAULT_PAGE_SIZE
}
