import { apiFetch } from '@/shared/utils/api-fetch'

export async function requestPasswordReset(
	email: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({ email, redirectTo: '/auth/reset-password' }),
		headers: { Origin: new URL(request.url).origin },
	})
}
