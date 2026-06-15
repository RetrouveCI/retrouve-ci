import type {
	ContactMessage,
	ContactMessageListResponse,
} from '../models/contact-message.model'
import type {
	ContactMessageStatus,
	CreateContactMessageData,
	ListContactMessagesFilter,
} from '../types/contact-message.types'

export const CONTACT_MESSAGE_REPOSITORY = Symbol('CONTACT_MESSAGE_REPOSITORY')

export interface ContactMessageRepository {
	create(data: CreateContactMessageData): Promise<ContactMessage>
	findById(id: string): Promise<ContactMessage | null>
	list(filter: ListContactMessagesFilter): Promise<ContactMessageListResponse>
	updateStatus(
		id: string,
		status: ContactMessageStatus,
	): Promise<ContactMessage>
}
