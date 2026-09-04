import { requestOrigin } from '@/shared/helpers/origin'
import { apiFetch } from '@/shared/utils/api-fetch'

export async function resetPassword(
	newPassword: string,
	token: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/admin-auth/reset-password', {
		method: 'POST',
		body: JSON.stringify({ newPassword, token }),
		headers: { Origin: requestOrigin(request) },
	})
}
