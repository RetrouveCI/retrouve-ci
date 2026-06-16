import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator'

export class ContactOwnerDto {
	@IsString()
	@IsNotEmpty()
	name!: string

	@IsString()
	@IsNotEmpty()
	phone!: string

	@IsEmail()
	@IsOptional()
	email?: string

	@IsString()
	@IsNotEmpty()
	@MinLength(5)
	@MaxLength(500)
	message!: string
}
