import { describe, expect, it } from 'vitest'
import { buildOtpMessage, type OtpPurpose } from './otp-message'
import { MAX_OTP_SMS_LENGTH, OTP_TTL_SECONDS } from './otp.const'

const PURPOSES: OtpPurpose[] = ['sign-in', 'password-reset']

describe('buildOtpMessage', () => {
	it('carries the code', () => {
		expect(buildOtpMessage('sign-in', '123456')).toContain('123456')
		expect(buildOtpMessage('password-reset', '654321')).toContain('654321')
	})

	it('tells the two purposes apart', () => {
		expect(buildOtpMessage('sign-in', '123456')).not.toBe(
			buildOtpMessage('password-reset', '123456'),
		)
	})

	// The agreed ceiling. Past it Letexto bills — and may split — the message.
	it.each(PURPOSES)('keeps %s within one SMS segment', purpose => {
		expect(buildOtpMessage(purpose, '123456').length).toBeLessThanOrEqual(
			MAX_OTP_SMS_LENGTH,
		)
	})

	// An accent switches the encoding from GSM-7 to UCS-2, which halves the
	// segment from 160 characters to 70 — so the templates carry none.
	it.each(PURPOSES)('stays within GSM-7 for %s', purpose => {
		expect(buildOtpMessage(purpose, '123456')).toMatch(/^[\x20-\x7E]+$/)
	})

	it('states the validity the plugin actually enforces', () => {
		expect(OTP_TTL_SECONDS).toBe(120)
		expect(buildOtpMessage('sign-in', '123456')).toContain('2 minutes')
	})
})
