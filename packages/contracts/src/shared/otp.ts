import { z } from 'zod'

/**
 * better-auth's `phoneNumber()` plugin defaults to `otpLength: 6` and the API
 * never overrides it, so a form accepting any other length asks for a code the
 * API can only reject.
 */
export const OTP_LENGTH = 6

/**
 * Here for the same reason `OTP_LENGTH` is: the API passes it to the plugin as
 * `expiresIn` and the front counts down to it. Both countdowns hard-coded 120,
 * so a code still live for three more minutes met a disabled button.
 */
export const OTP_TTL_SECONDS = 300

/** When a new code may be asked for — a different question from expiry. */
export const OTP_RESEND_DELAY_SECONDS = 30

export const OTP_ERROR_MESSAGE = `Entrez le code complet à ${OTP_LENGTH} chiffres`

export const otpCodeSchema = z
	.string({ error: OTP_ERROR_MESSAGE })
	.trim()
	.regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), OTP_ERROR_MESSAGE)
