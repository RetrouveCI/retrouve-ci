import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { MODERATION_STATUSES } from '@/domains/lost-items/constants'
import type { ModerationStatus } from '@/domains/lost-items/types/lost-item.types'

export class UpdateModerationStatusDto {
	@ApiProperty({ enum: MODERATION_STATUSES })
	@IsIn(MODERATION_STATUSES)
	moderationStatus!: ModerationStatus
}
