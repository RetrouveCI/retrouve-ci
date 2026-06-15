import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin, phoneNumber } from 'better-auth/plugins'
import { prisma } from '@retrouve-ci/database'

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: 'postgresql' }),
	secret: process.env['BETTER_AUTH_SECRET'],
	baseURL: process.env['BETTER_AUTH_URL'],
	trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
		sendResetPassword: async ({ user, url }) => {
			console.log(`[auth] Password reset for ${user.email}: ${url}`)
		},
	},
	user: {
		deleteUser: {
			enabled: true,
		},
	},
	plugins: [
		phoneNumber({
			sendOTP: ({ phoneNumber, code }) => {
				console.log(`[auth] OTP for ${phoneNumber}: ${code}`)
			},
			sendPasswordResetOTP: ({ phoneNumber, code }) => {
				console.log(`[auth] Password reset OTP for ${phoneNumber}: ${code}`)
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
