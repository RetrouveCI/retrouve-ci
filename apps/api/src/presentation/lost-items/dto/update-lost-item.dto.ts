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
	MAX_PHOTOS,
	MIN_DESCRIPTION_LENGTH,
	RESOLUTION_STATUSES,
} from '@/domains/lost-items/constants'
import type { ResolutionStatus } from '@/domains/lost-items/types/lost-item.types'

export class UpdateLostItemDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(120)
	title?: string

	@IsOptional()
	@IsString()
	@MinLength(MIN_DESCRIPTION_LENGTH)
	@MaxLength(2000)
	description?: string

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	ville?: string

	@IsOptional()
	@IsString()
	@MaxLength(120)
	commune?: string

	@IsOptional()
	@IsDateString()
	eventDate?: string

	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	contactName?: string

	@IsOptional()
	@IsString()
	@MinLength(8)
	@MaxLength(20)
	contactWhatsapp?: string

	@IsOptional()
	@IsArray()
	@ArrayMaxSize(MAX_PHOTOS)
	@IsString({ each: true })
	photos?: string[]

	@IsOptional()
	@IsIn(RESOLUTION_STATUSES)
	resolutionStatus?: ResolutionStatus
}
