import { authClient } from '@/shared/helpers/auth-client'
import { toE164 } from '@/shared/utils/phone'

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
