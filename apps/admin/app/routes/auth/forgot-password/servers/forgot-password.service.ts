import { appUrl } from '@/shared/helpers/redirect'
import { apiFetch } from '@/shared/utils/api-fetch'

export async function requestPasswordReset(
	email: string,
	request: Request,
): Promise<void> {
	await apiFetch('/api/admin-auth/request-password-reset', {
		method: 'POST',
		body: JSON.stringify({
			email,
			redirectTo: appUrl('/reset-password', request),
		}),
		headers: { Origin: new URL(request.url).origin },
	})
}
