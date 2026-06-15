import type {
	ContactMessage,
	ContactMessageListResponse,
	ContactMessageStatus,
} from '@/domain/entities/contact-message'

export interface IContactMessageRepository {
	list(params: {
		status?: ContactMessageStatus
		page: number
		pageSize: number
	}): Promise<ContactMessageListResponse>
	getById(id: string): Promise<ContactMessage>
	updateStatus(
		id: string,
		status: ContactMessageStatus,
	): Promise<ContactMessage>
}
