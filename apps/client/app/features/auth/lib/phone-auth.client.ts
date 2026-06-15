import { authClient } from '@/shared/auth/auth-client'
import { toE164 } from '@/shared/auth/phone'

export async function sendPhoneOtp(phoneNumber: string): Promise<boolean> {
	const result = await authClient.phoneNumber.sendOtp({
		phoneNumber: toE164(phoneNumber),
	})

	return !result.error
}

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

export async function requestPhonePasswordReset(
	phoneNumber: string,
): Promise<boolean> {
	const result = await authClient.phoneNumber.requestPasswordReset({
		phoneNumber: toE164(phoneNumber),
	})

	return !result.error
}

export async function resetPhonePassword(params: {
	phoneNumber: string
	otp: string
	newPassword: string
}): Promise<boolean> {
	const result = await authClient.phoneNumber.resetPassword({
		phoneNumber: toE164(params.phoneNumber),
		otp: params.otp,
		newPassword: params.newPassword,
	})

	return !result.error
}
