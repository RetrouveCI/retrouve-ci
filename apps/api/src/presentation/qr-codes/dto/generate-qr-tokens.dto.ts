import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger'
import {
	IsInt,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
} from 'class-validator'
import {
	MAX_GENERATE_COUNT,
	MIN_GENERATE_COUNT,
} from '@/domains/qr-codes/constants'

export class GenerateQrTokensDto {
	@ApiProperty({ minimum: MIN_GENERATE_COUNT, maximum: MAX_GENERATE_COUNT })
	@IsInt()
	@Min(MIN_GENERATE_COUNT)
	@Max(MAX_GENERATE_COUNT)
	count!: number

	@ApiPropertyOptional({ maxLength: 60 })
	@IsOptional()
	@IsString()
	@MaxLength(60)
	batch?: string
}
