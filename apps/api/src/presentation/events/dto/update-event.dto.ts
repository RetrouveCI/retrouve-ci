import { ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsDateString,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'
import { EVENT_STATUSES, MIN_DESCRIPTION_LENGTH } from '@/domains/events/constants'
import type { EventStatus } from '@/domains/events/types/event.types'

export class UpdateEventDto {
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

	@ApiPropertyOptional({ minLength: 2, maxLength: 200 })
	@IsOptional()
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	location?: string

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

	@ApiPropertyOptional({ enum: EVENT_STATUSES })
	@IsOptional()
	@IsIn(EVENT_STATUSES)
	status?: EventStatus
}
