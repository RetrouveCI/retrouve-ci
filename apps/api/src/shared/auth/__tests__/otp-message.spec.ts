import { describe, expect, it } from 'vitest'
import { buildOtpMessage, type OtpPurpose } from '../otp-message'
import { OTP_TTL_SECONDS } from '@app/contracts/shared'
import { MAX_OTP_SMS_LENGTH } from '../otp.const'

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

	// The TTL itself is pinned in `@app/contracts/shared`, which is where both
	// sides read it; what this asserts is that the template says the same thing
	// the plugin enforces.
	it('states the validity the plugin actually enforces', () => {
		expect(buildOtpMessage('sign-in', '123456')).toContain(
			`${OTP_TTL_SECONDS / 60} minutes`,
		)
	})
})
