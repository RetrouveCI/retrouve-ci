import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'
import { toE164 } from '@/shared/utils/phone'

export async function updateProfile(
	request: Request,
	fields: { name?: string; city?: string; commune?: string },
): Promise<void> {
	await apiFetch('/api/auth/update-user', {
		method: 'POST',
		body: JSON.stringify(fields),
		headers: {
			Cookie: request.headers.get('cookie') ?? '',
			Origin: requestOrigin(request),
		},
	})
}

export async function sendPhoneChangeOtp(
	request: Request,
	phone: string,
): Promise<void> {
	await apiFetch('/api/auth/phone-number/send-otp', {
		method: 'POST',
		body: JSON.stringify({ phoneNumber: toE164(phone) }),
		headers: { Origin: requestOrigin(request) },
	})
}

export async function deleteAccount(
	password: string,
	request: Request,
): Promise<void> {
	await apiFetch<{ success: boolean; message: string }>(
		'/api/auth/delete-user',
		{
			method: 'POST',
			body: JSON.stringify({ password }),
			headers: {
				Cookie: request.headers.get('cookie') ?? '',
				Origin: requestOrigin(request),
			},
		},
	)
}
