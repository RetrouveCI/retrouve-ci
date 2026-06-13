import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, Max, Min, IsOptional } from 'class-validator'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/domains/events/constants'

export class ListEventsQueryDto {
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
