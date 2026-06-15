import { apiFetch } from '@/shared/lib/api-client'
import { toE164 } from '@/shared/auth/phone'

export async function requestPasswordResetOtp(
	phoneNumber: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phoneNumber) }),
		headers: { Origin: new URL(request.url).origin },
	})
}

export async function resetPassword(
	params: { phoneNumber: string; otp: string; newPassword: string },
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/reset-password', {
		method: 'POST',
		body: JSON.stringify({
			phoneNumber: toE164(params.phoneNumber),
			otp: params.otp,
			newPassword: params.newPassword,
		}),
		headers: { Origin: new URL(request.url).origin },
	})
}
