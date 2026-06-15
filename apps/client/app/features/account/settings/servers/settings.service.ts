import { apiFetch } from '@/shared/lib/api-client'

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
				Origin: new URL(request.url).origin,
			},
		},
	)
}
