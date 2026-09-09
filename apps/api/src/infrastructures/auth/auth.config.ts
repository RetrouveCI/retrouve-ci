import { createAuth as createSharedAuth } from '@app/auth'
import { phoneNumber } from 'better-auth/plugins'
import { isValidLocalNumber, OTP_TTL_SECONDS } from '@app/contracts/shared'
import type { PrismaClient } from '@app/database'
import { getAllowedOrigins } from '@/shared/auth/allowed-origins'
import { getCookieDomain } from '@/shared/auth/cookie-domain'
import type { OtpDispatcher } from './otp-dispatcher.service'

export const ADMIN_AUTH_BASE_PATH = '/api/admin-auth'

const ADMIN_APP_NAME = 'retrouveci-admin'

export function createClientAuth(prisma: PrismaClient, otp: OtpDispatcher) {
	return createSharedAuth(prisma, {
		trustedOrigins: getAllowedOrigins(),
		cookieDomain: getCookieDomain(),
		plugins: [
			phoneNumber({
				expiresIn: OTP_TTL_SECONDS,
				// Guards /sign-in/phone-number and /phone-number/send-otp only, so it is
				// the sign-in predicate: strict here would lock out existing accounts.
				phoneNumberValidator: isValidLocalNumber,
				sendOTP: ({ phoneNumber, code }) =>
					otp.dispatch({ purpose: 'sign-in', phoneNumber, code }),
				sendPasswordResetOTP: ({ phoneNumber, code }) =>
					otp.dispatch({ purpose: 'password-reset', phoneNumber, code }),
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
		trustedOrigins: getAllowedOrigins(),
		cookieDomain: getCookieDomain(),
	})
}

export type Auth = ReturnType<typeof createClientAuth>
export type AdminAuth = ReturnType<typeof createAdminAuth>
