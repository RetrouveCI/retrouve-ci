import { apiFetch } from '@/shared/lib/api-client'

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
