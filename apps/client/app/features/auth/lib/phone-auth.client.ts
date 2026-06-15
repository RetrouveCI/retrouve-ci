import { authClient } from '@/shared/auth/auth-client'
import { toE164 } from '@/shared/auth/phone'

export async function verifyPhoneOtp(
	phoneNumber: string,
	code: string,
): Promise<boolean> {
	const result = await authClient.phoneNumber.verify({
		phoneNumber: toE164(phoneNumber),
		code,
	})

	return !result.error
}
