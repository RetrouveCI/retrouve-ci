import type { BatchUpdateContactMessageStatusData } from '@app/contracts/contact-messages'
import type { BatchOutcome } from '@app/contracts/shared'
import { apiFetch } from '@/shared/utils/api-fetch'
import type {
	ContactMessage,
	ContactMessageListResponse,
	ContactMessageStatus,
} from '../types/contact-messages.types'

/** Archiving a selection. The API runs them one at a time and says which. */
export async function updateContactMessageStatusBatch(
	body: BatchUpdateContactMessageStatusData,
	request: Request,
): Promise<BatchOutcome> {
	return apiFetch<BatchOutcome>('/contact-messages/status/batch', {
		method: 'PATCH',
		body: JSON.stringify(body),
		request,
	})
}

export async function listContactMessages(
	params: {
		status?: ContactMessageStatus
		search?: string
		page?: number
		pageSize?: number
	},
	request: Request,
): Promise<ContactMessageListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 20),
	})
	if (params.status) query.set('status', params.status)
	if (params.search) query.set('search', params.search)

	return apiFetch<ContactMessageListResponse>(
		`/contact-messages?${query.toString()}`,
		{ request },
	)
}

export async function getContactMessageById(
	id: string,
	request: Request,
): Promise<ContactMessage> {
	return apiFetch<ContactMessage>(`/contact-messages/${id}`, {
		request,
	})
}

export async function updateContactMessageStatus(
	id: string,
	status: ContactMessageStatus,
	request: Request,
): Promise<ContactMessage> {
	return apiFetch<ContactMessage>(`/contact-messages/${id}/status`, {
		method: 'PATCH',
		body: JSON.stringify({ status }),
		request,
	})
}
