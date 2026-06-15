import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateContactMessageDto {
	@ApiProperty({ minLength: 2, maxLength: 100 })
	@IsString()
	@MinLength(2)
	@MaxLength(100)
	name!: string

	@ApiProperty()
	@IsEmail()
	email!: string

	@ApiProperty({ minLength: 2, maxLength: 150 })
	@IsString()
	@MinLength(2)
	@MaxLength(150)
	subject!: string

	@ApiProperty({ minLength: 10, maxLength: 2000 })
	@IsString()
	@MinLength(10)
	@MaxLength(2000)
	message!: string
}
