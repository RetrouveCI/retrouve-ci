import type { CreateAuthOptions } from '@app/auth'
import { createAuth } from '@app/auth'
import type { PrismaClient } from '@app/database'
import { isValidLocalNumber } from '@app/contracts/shared'
import { phoneNumber } from 'better-auth/plugins'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAllowedOrigins } from '@/shared/auth/allowed-origins'
import { OTP_TTL_SECONDS } from '@/shared/auth/otp.const'
import type { OtpDispatcher } from '../otp-dispatcher.service'
import {
	ADMIN_AUTH_BASE_PATH,
	createAdminAuth,
	createClientAuth,
} from '../auth.config'

vi.mock('@app/auth', () => ({ createAuth: vi.fn(() => ({})) }))

vi.mock('better-auth/plugins', () => ({
	phoneNumber: vi.fn((options: unknown) => ({ id: 'phone-number', options })),
}))

interface PhoneNumberOptions {
	expiresIn: number
	phoneNumberValidator: (value: string) => boolean
	sendOTP: (input: { phoneNumber: string; code: string }) => Promise<void>
	sendPasswordResetOTP: (input: {
		phoneNumber: string
		code: string
	}) => Promise<void>
	signUpOnVerification: {
		getTempEmail: (phoneNumber: string) => string
		getTempName: (phoneNumber: string) => string
	}
}

const prisma = {} as PrismaClient

function buildOtpDispatcher() {
	return {
		dispatch: vi.fn().mockResolvedValue(undefined),
	} as unknown as OtpDispatcher & { dispatch: ReturnType<typeof vi.fn> }
}

function lastAuthOptions(): CreateAuthOptions {
	const calls = vi.mocked(createAuth).mock.calls
	return calls[calls.length - 1]?.[1] as CreateAuthOptions
}

function phoneOptions(): PhoneNumberOptions {
	const calls = vi.mocked(phoneNumber).mock.calls
	return calls[calls.length - 1]?.[0] as unknown as PhoneNumberOptions
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('createAdminAuth', () => {
	// The three options that give the backoffice a cookie of its own. Any one of
	// them dropped puts both apps back on a single shared session.
	it('names the backoffice instance apart from the public one', () => {
		createAdminAuth(prisma)

		expect(lastAuthOptions()).toMatchObject({
			appName: 'retrouveci-admin',
			basePath: ADMIN_AUTH_BASE_PATH,
			cookiePrefix: 'retrouveci-admin',
		})
	})

	it('mounts the backoffice on its own base path', () => {
		expect(ADMIN_AUTH_BASE_PATH).toBe('/api/admin-auth')
	})

	it('carries no phone-number plugin', () => {
		createAdminAuth(prisma)

		expect(phoneNumber).not.toHaveBeenCalled()
		expect(lastAuthOptions().plugins ?? []).toEqual([])
	})
})

describe('createClientAuth', () => {
	// Renaming the public instance would change its cookie prefix and sign every
	// existing user out.
	it('leaves the public instance on better-auth defaults', () => {
		createClientAuth(prisma, buildOtpDispatcher())

		const options = lastAuthOptions()
		expect(options.appName).toBeUndefined()
		expect(options.basePath).toBeUndefined()
		expect(options.cookiePrefix).toBeUndefined()
	})

	it('registers the phone-number plugin', () => {
		createClientAuth(prisma, buildOtpDispatcher())

		expect(phoneNumber).toHaveBeenCalledTimes(1)
		expect(lastAuthOptions().plugins).toHaveLength(1)
	})
})

describe('both instances', () => {
	it('trust the same origins', () => {
		createClientAuth(prisma, buildOtpDispatcher())
		const client = lastAuthOptions()
		createAdminAuth(prisma)
		const admin = lastAuthOptions()

		expect(client.trustedOrigins).toEqual(getAllowedOrigins())
		expect(admin.trustedOrigins).toEqual(client.trustedOrigins)
	})

	it('share one cookie domain', () => {
		createClientAuth(prisma, buildOtpDispatcher())
		const client = lastAuthOptions()
		createAdminAuth(prisma)

		expect(lastAuthOptions().cookieDomain).toBe(client.cookieDomain)
	})
})

describe('phone-number plugin', () => {
	it('expires a code after the documented delay', () => {
		createClientAuth(prisma, buildOtpDispatcher())

		expect(phoneOptions().expiresIn).toBe(OTP_TTL_SECONDS)
	})

	// Without it a malformed number only fails at delivery, after the consumer
	// has burnt its three attempts.
	it('rejects a malformed number before it reaches the queue', () => {
		createClientAuth(prisma, buildOtpDispatcher())

		const { phoneNumberValidator } = phoneOptions()
		expect(phoneNumberValidator).toBe(isValidLocalNumber)
		expect(phoneNumberValidator('0585743342')).toBe(true)
		expect(phoneNumberValidator('123')).toBe(false)
	})

	it('dispatches a sign-in code', async () => {
		const otp = buildOtpDispatcher()
		createClientAuth(prisma, otp)

		await phoneOptions().sendOTP({
			phoneNumber: '+2250585743342',
			code: '123456',
		})

		expect(otp.dispatch).toHaveBeenCalledWith({
			purpose: 'sign-in',
			phoneNumber: '+2250585743342',
			code: '123456',
		})
	})

	it('dispatches a password-reset code under its own purpose', async () => {
		const otp = buildOtpDispatcher()
		createClientAuth(prisma, otp)

		await phoneOptions().sendPasswordResetOTP({
			phoneNumber: '+2250585743342',
			code: '654321',
		})

		expect(otp.dispatch).toHaveBeenCalledWith({
			purpose: 'password-reset',
			phoneNumber: '+2250585743342',
			code: '654321',
		})
	})

	// The user table requires an email, which a phone sign-up never provides.
	it('derives a placeholder identity from the number at sign-up', () => {
		createClientAuth(prisma, buildOtpDispatcher())

		const { getTempEmail, getTempName } = phoneOptions().signUpOnVerification
		expect(getTempEmail('+2250585743342')).toBe(
			'+2250585743342@phone.retrouveci.local',
		)
		expect(getTempName('+2250585743342')).toBe('+2250585743342')
	})
})
