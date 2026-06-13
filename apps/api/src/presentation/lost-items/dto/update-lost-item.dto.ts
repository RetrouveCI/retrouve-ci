import { ApiPropertyOptional } from '@nestjs/swagger'
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
	@ApiPropertyOptional({ minLength: 3, maxLength: 120 })
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(120)
	title?: string

	@ApiPropertyOptional({ minLength: MIN_DESCRIPTION_LENGTH, maxLength: 2000 })
	@IsOptional()
	@IsString()
	@MinLength(MIN_DESCRIPTION_LENGTH)
	@MaxLength(2000)
	description?: string

	@ApiPropertyOptional({ minLength: 2, maxLength: 120 })
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	ville?: string

	@ApiPropertyOptional({ maxLength: 120 })
	@IsOptional()
	@IsString()
	@MaxLength(120)
	commune?: string

	@ApiPropertyOptional({ format: 'date-time' })
	@IsOptional()
	@IsDateString()
	eventDate?: string

	@ApiPropertyOptional({ minLength: 2, maxLength: 120 })
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(120)
	contactName?: string

	@ApiPropertyOptional({ minLength: 8, maxLength: 20 })
	@IsOptional()
	@IsString()
	@MinLength(8)
	@MaxLength(20)
	contactWhatsapp?: string

	@ApiPropertyOptional({ type: [String], maxItems: MAX_PHOTOS })
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(MAX_PHOTOS)
	@IsString({ each: true })
	photos?: string[]

	@ApiPropertyOptional({ enum: RESOLUTION_STATUSES })
	@IsOptional()
	@IsIn(RESOLUTION_STATUSES)
	resolutionStatus?: ResolutionStatus
}
