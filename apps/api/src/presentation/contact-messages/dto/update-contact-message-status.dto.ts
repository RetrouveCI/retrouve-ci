import { ApiProperty } from '@nestjs/swagger'
import { IsIn } from 'class-validator'
import { CONTACT_MESSAGE_UPDATABLE_STATUSES } from '@/domains/contact-messages/constants'
import type { ContactMessageStatus } from '@/domains/contact-messages/types/contact-message.types'

export class UpdateContactMessageStatusDto {
	@ApiProperty({ enum: CONTACT_MESSAGE_UPDATABLE_STATUSES })
	@IsIn(CONTACT_MESSAGE_UPDATABLE_STATUSES)
	status!: ContactMessageStatus
}
