import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'
import { EVENT_STATUSES } from '@/domains/events/constants'
import type { EventStatus } from '@/domains/events/types/event.types'
import { ListEventsQueryDto } from './list-events.query.dto'

export class AdminListEventsQueryDto extends ListEventsQueryDto {
	@ApiPropertyOptional({ enum: EVENT_STATUSES })
	@IsOptional()
	@IsIn(EVENT_STATUSES)
	status?: EventStatus
}
