import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsDateString,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'
import { MIN_DESCRIPTION_LENGTH } from '@/domains/events/constants'

export class CreateEventDto {
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

	@ApiProperty({ minLength: 2, maxLength: 200 })
	@IsString()
	@MinLength(2)
	@MaxLength(200)
	location!: string

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
}
