import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator'
import {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/domains/notifications/constants'

export class ListNotificationsQueryDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Transform(({ value }) => value === 'true' || value === true)
	@IsBoolean()
	read?: boolean

	@ApiPropertyOptional({ minimum: 1, default: 1 })
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page: number = 1

	@ApiPropertyOptional({
		minimum: 1,
		maximum: MAX_PAGE_SIZE,
		default: DEFAULT_PAGE_SIZE,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(MAX_PAGE_SIZE)
	pageSize: number = DEFAULT_PAGE_SIZE
}
