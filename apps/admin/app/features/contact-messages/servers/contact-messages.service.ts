import { apiFetch } from '@/shared/lib/api-client'
import type {
	ContactMessage,
	ContactMessageListResponse,
	ContactMessageStatus,
} from '../contact-messages.types'

export async function listContactMessages(
	params: { status?: ContactMessageStatus; page?: number; pageSize?: number },
	request: Request,
): Promise<ContactMessageListResponse> {
	const query = new URLSearchParams({
		page: String(params.page ?? 1),
		pageSize: String(params.pageSize ?? 20),
	})
	if (params.status) query.set('status', params.status)

	return apiFetch<ContactMessageListResponse>(
		`/contact-messages?${query.toString()}`,
		{ headers: { Cookie: request.headers.get('cookie') ?? '' } },
	)
}

export async function getContactMessageById(
	id: string,
	request: Request,
): Promise<ContactMessage> {
	return apiFetch<ContactMessage>(`/contact-messages/${id}`, {
		headers: { Cookie: request.headers.get('cookie') ?? '' },
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
		headers: { Cookie: request.headers.get('cookie') ?? '' },
	})
}
