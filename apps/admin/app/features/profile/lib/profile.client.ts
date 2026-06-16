import { authClient } from '@/shared/auth/auth-client'

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
	const result = await authClient.changePassword({
		currentPassword,
		newPassword,
		revokeOtherSessions: false,
	})

	if (result.error) {
		return { ok: false, error: result.error.message ?? 'Mot de passe actuel incorrect' }
	}

	return { ok: true }
}
