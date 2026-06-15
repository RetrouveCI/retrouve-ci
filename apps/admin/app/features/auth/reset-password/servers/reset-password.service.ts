import { apiFetch } from '@/shared/lib/api-client'

export async function resetPassword(
	newPassword: string,
	token: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ newPassword, token }),
		headers: { Origin: new URL(request.url).origin },
	})
}
