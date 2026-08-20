import { createAuth as createSharedAuth, logSecretDelivery } from '@app/auth'
import { phoneNumber } from 'better-auth/plugins'
import type { PrismaClient } from '@app/database'

export const ADMIN_AUTH_BASE_PATH = '/api/admin-auth'

const ADMIN_APP_NAME = 'retrouveci-admin'

export function createClientAuth(prisma: PrismaClient) {
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

/**
 * The distinct `cookiePrefix` is what gives the backoffice its own session. The
 * public app keeps better-auth's default prefix, so existing sessions there
 * survive this change.
 */
export function createAdminAuth(prisma: PrismaClient) {
	return createSharedAuth(prisma, {
		appName: ADMIN_APP_NAME,
		basePath: ADMIN_AUTH_BASE_PATH,
		cookiePrefix: ADMIN_APP_NAME,
	})
}

export type Auth = ReturnType<typeof createClientAuth>
export type AdminAuth = ReturnType<typeof createAdminAuth>
