import type { CreateContactMessageData } from '@app/contracts/contact-messages'
import { apiFetch } from '@/shared/utils/api-fetch'

export async function submitContactMessage(
	data: CreateContactMessageData,
	request: Request,
): Promise<void> {
	await apiFetch('/contact-messages', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: { Origin: new URL(request.url).origin },
	})
}
