import { apiFetch } from '@/shared/lib/api-client'
import { toE164 } from '@/shared/auth/phone'

export async function requestPasswordReset(
	phoneNumber: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phoneNumber) }),
		headers: { Origin: new URL(request.url).origin },
	})
}
