import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'
import { toE164 } from '@/shared/utils/phone'

export async function requestPasswordReset(
	phoneNumber: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phoneNumber) }),
		headers: { Origin: requestOrigin(request) },
	})
}
