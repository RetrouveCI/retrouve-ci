import type { z } from 'zod'
import { apiFetch } from '@/shared/utils/api-fetch'
import type { contactSchema } from '../contact.schema'

export async function submitContactMessage(
	data: z.infer<typeof contactSchema>,
	request: Request,
): Promise<void> {
	await apiFetch('/contact-messages', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: { Origin: new URL(request.url).origin },
	})
}
