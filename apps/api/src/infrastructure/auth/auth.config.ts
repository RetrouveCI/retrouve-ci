import { createAuth as createSharedAuth, logSecretDelivery } from '@app/auth'
import { phoneNumber } from 'better-auth/plugins'
import type { PrismaClient } from '@app/database'

export function createAuth(prisma: PrismaClient) {
	return createSharedAuth(prisma, {
		plugins: [
			phoneNumber({
				sendOTP: ({ phoneNumber, code }) => {
					logSecretDelivery('OTP', phoneNumber, code)
				},
				sendPasswordResetOTP: ({ phoneNumber, code }) => {
					logSecretDelivery('Password reset OTP', phoneNumber, code)
				},
				signUpOnVerification: {
					getTempEmail: phoneNumber => `${phoneNumber}@phone.retrouveci.local`,
					getTempName: phoneNumber => phoneNumber,
				},
			}),
		],
	})
}

export type Auth = ReturnType<typeof createAuth>
