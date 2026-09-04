import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'
import { toE164 } from '@/shared/utils/phone'

export async function requestPasswordResetOtp(
	phoneNumber: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phoneNumber) }),
		headers: { Origin: requestOrigin(request) },
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
		headers: { Origin: requestOrigin(request) },
	})
}
