import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'
import {
	CONTACT_MESSAGE_STATUSES,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
} from '@/domains/contact-messages/constants'
import type { ContactMessageStatus } from '@/domains/contact-messages/types/contact-message.types'

export class ListContactMessagesQueryDto {
	@ApiPropertyOptional({ enum: CONTACT_MESSAGE_STATUSES })
	@IsOptional()
	@IsIn(CONTACT_MESSAGE_STATUSES)
	status?: ContactMessageStatus

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
