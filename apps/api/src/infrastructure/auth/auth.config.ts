import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, phoneNumber } from 'better-auth/plugins'
import { prisma } from '@retrouve-ci/database'

const DEFAULT_TRUSTED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:3001',
]

function getTrustedOrigins(): string[] {
	const configuredOrigins = process.env['BETTER_AUTH_TRUSTED_ORIGINS']
		?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)

	if (configuredOrigins?.length) {
		return configuredOrigins
	}

	return process.env['NODE_ENV'] === 'production' ? [] : DEFAULT_TRUSTED_ORIGINS
}

function logSecretDelivery(
	kind: string,
	recipient: string,
	secret: string,
): void {
	if (process.env['NODE_ENV'] === 'production') {
		console.warn(`[auth] ${kind} delivery is not configured for ${recipient}`)
		return
	}

	console.log(`[auth] ${kind} for ${recipient}: ${secret}`)
}

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	secret: process.env['BETTER_AUTH_SECRET'],
	baseURL: process.env['BETTER_AUTH_URL'],
	trustedOrigins: getTrustedOrigins(),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
		sendResetPassword: async ({ user, url }) => {
			logSecretDelivery('Password reset', user.email, url)
		},
	},
	user: {
		additionalFields: {
			city: { type: 'string', required: false, input: true },
			commune: { type: 'string', required: false, input: true },
		},
		deleteUser: {
			enabled: true,
		},
	},
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
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
	],
})
