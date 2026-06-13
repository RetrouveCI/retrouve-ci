import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'
import { MODERATION_STATUSES } from '@/domains/lost-items/constants'
import type { ModerationStatus } from '@/domains/lost-items/types/lost-item.types'
import { ListLostItemsQueryDto } from './list-lost-items.query.dto'

export class AdminListLostItemsQueryDto extends ListLostItemsQueryDto {
	@ApiPropertyOptional({ enum: MODERATION_STATUSES })
	@IsOptional()
	@IsIn(MODERATION_STATUSES)
	moderationStatus?: ModerationStatus
}
