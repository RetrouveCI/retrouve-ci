import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateQrTokenDto {
	@ApiPropertyOptional({ maxLength: 60 })
	@IsOptional()
	@IsString()
	@MaxLength(60)
	label?: string

	@ApiPropertyOptional({ maxLength: 120 })
	@IsOptional()
	@IsString()
	@MaxLength(120)
	linkedObject?: string
}
