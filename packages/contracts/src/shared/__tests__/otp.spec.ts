import { describe, expect, it } from 'vitest'
import {
	OTP_ERROR_MESSAGE,
	OTP_LENGTH,
	OTP_RESEND_DELAY_SECONDS,
	OTP_TTL_SECONDS,
	otpCodeSchema,
} from '../otp'

describe('otpCodeSchema', () => {
	it('accepts a code of exactly the length better-auth issues', () => {
		expect(OTP_LENGTH).toBe(6)
		expect(otpCodeSchema.safeParse('123456').success).toBe(true)
	})

	it('trims what a paste brings along', () => {
		expect(otpCodeSchema.safeParse(' 123456 ').data).toBe('123456')
	})

	// The drift: one form accepted 4 to 8 digits, so a 4-digit code passed
	// validation and was then refused by the API every time.
	it.each(['1234', '12345', '1234567', '12345678'])('refuses %s', input => {
		const result = otpCodeSchema.safeParse(input)

		expect(result.success).toBe(false)
		expect(result.error?.issues[0]?.message).toBe(OTP_ERROR_MESSAGE)
	})

	it.each(['', '12 34 56', 'abcdef', '12345a'])(
		'refuses %s for not being six digits',
		input => {
			expect(otpCodeSchema.safeParse(input).success).toBe(false)
		},
	)
})

describe('otpCodeSchema, on a field that never arrived', () => {
	it.each([undefined, null, 123456])('answers %j in French', input => {
		expect(otpCodeSchema.safeParse(input).error?.issues[0]?.message).toBe(
			OTP_ERROR_MESSAGE,
		)
	})
})

describe('OTP timings', () => {
	// Moved here from `apps/api`, which no longer owns the value. The API hands
	// it to better-auth as `expiresIn` and the SMS template names it in minutes,
	// so it has to divide cleanly.
	it('gives a code the five minutes better-auth defaults to', () => {
		expect(OTP_TTL_SECONDS).toBe(300)
		expect(OTP_TTL_SECONDS % 60).toBe(0)
	})

	// The drift this closed: both front-end countdowns hard-coded 120, so at two
	// minutes the confirm button went disabled while the server still honoured
	// the code for three more.
	it('offers a resend well before the code dies', () => {
		expect(OTP_RESEND_DELAY_SECONDS).toBe(30)
		expect(OTP_RESEND_DELAY_SECONDS).toBeLessThan(OTP_TTL_SECONDS)
	})
})
