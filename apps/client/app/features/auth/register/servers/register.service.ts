import { apiFetch } from '@/shared/lib/api-client'
import { toE164 } from '@/shared/auth/phone'

export async function setInitialPassword(
	newPassword: string,
	request: Request,
): Promise<void> {
	await apiFetch('/account/set-initial-password', {
		method: 'POST',
		body: JSON.stringify({ newPassword }),
		headers: {
			Cookie: request.headers.get('cookie') ?? '',
			Origin: new URL(request.url).origin,
		},
	})
}

export async function sendOtp(
	phoneNumber: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/send-otp', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phoneNumber) }),
		headers: { Origin: new URL(request.url).origin },
	})
}
