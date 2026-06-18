import { authClient } from '@/shared/auth/auth-client'
import { toE164 } from '@/shared/auth/phone'

interface Result {
	ok: boolean
	error?: string
}

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<Result> {
	const result = await authClient.changePassword({
		currentPassword,
		newPassword,
		revokeOtherSessions: false,
	})

	if (result.error) {
		return {
			ok: false,
			error: result.error.message ?? 'Mot de passe actuel incorrect',
		}
	}

	return { ok: true }
}

export async function verifyPhoneChange(
	phone: string,
	code: string,
): Promise<Result> {
	const result = await authClient.phoneNumber.verify({
		phoneNumber: toE164(phone),
		code,
		updatePhoneNumber: true,
	})

	if (result.error) {
		return { ok: false, error: result.error.message ?? 'Code invalide' }
	}

	return { ok: true }
}
