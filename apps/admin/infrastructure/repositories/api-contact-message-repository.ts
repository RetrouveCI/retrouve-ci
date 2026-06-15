import { apiFetch } from '@/infrastructure/http/api-client'
import type { IContactMessageRepository } from '@/domain/repositories/contact-message-repository'
import type {
	ContactMessage,
	ContactMessageListResponse,
	ContactMessageStatus,
} from '@/domain/entities/contact-message'

class ApiContactMessageRepository implements IContactMessageRepository {
	async list(params: {
		status?: ContactMessageStatus
		page: number
		pageSize: number
	}): Promise<ContactMessageListResponse> {
		const query = new URLSearchParams({
			page: String(params.page),
			pageSize: String(params.pageSize),
		})
		if (params.status) query.set('status', params.status)

		return apiFetch(`/contact-messages?${query.toString()}`)
	}

	async getById(id: string): Promise<ContactMessage> {
		return apiFetch(`/contact-messages/${id}`)
	}

	async updateStatus(
		id: string,
		status: ContactMessageStatus,
	): Promise<ContactMessage> {
		return apiFetch(`/contact-messages/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify({ status }),
		})
	}
}

export const contactMessageRepository: IContactMessageRepository =
	new ApiContactMessageRepository()
