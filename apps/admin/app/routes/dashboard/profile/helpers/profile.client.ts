import { authClient } from '@/shared/helpers/auth-client'
import { getAuthErrorMessage } from '@/shared/helpers/error-messages'
import type { ChangePasswordInput } from '../profile.schema'

/**
 * Which field a better-auth failure belongs to. Anything absent from this map
 * belongs to the form as a whole, and is reported through `root`.
 */
const FAILURE_FIELDS: Record<string, keyof ChangePasswordInput> = {
	INVALID_PASSWORD: 'currentPassword',
	PASSWORD_TOO_SHORT: 'newPassword',
	PASSWORD_TOO_LONG: 'newPassword',
}

export type ChangePasswordResult =
	| { success: true }
	| { success: false; error: string; field?: keyof ChangePasswordInput }

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<ChangePasswordResult> {
	const result = await authClient.changePassword({
		currentPassword,
		newPassword,
		revokeOtherSessions: false,
	})

	if (result.error) {
		return {
			success: false,
			error: getAuthErrorMessage(result.error.code),
			field: result.error.code ? FAILURE_FIELDS[result.error.code] : undefined,
		}
	}

	return { success: true }
}
