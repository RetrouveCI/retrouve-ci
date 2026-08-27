import type { ContactMessageStatus } from '@app/contracts/contact-messages'
import type { Paginated } from '@app/contracts/shared'

export type { ContactMessageStatus }

export interface ContactMessage {
	id: string
	name: string
	email: string | null
	phone: string | null
	subject: string
	message: string
	status: ContactMessageStatus
	qrTokenCode: string | null
	recipientUserId: string | null
	createdAt: string
	readAt: string | null
}

export type ContactMessageListResponse = Paginated<ContactMessage>
