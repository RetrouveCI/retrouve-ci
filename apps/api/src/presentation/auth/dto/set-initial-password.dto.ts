import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class SetInitialPasswordDto {
	@ApiProperty({ minLength: 6, maxLength: 128 })
	@IsString()
	@MinLength(6)
	@MaxLength(128)
	newPassword!: string
}
