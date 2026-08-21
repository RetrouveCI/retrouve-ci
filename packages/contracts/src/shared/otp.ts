import { z } from 'zod'

/**
 * better-auth's `phoneNumber()` plugin defaults to `otpLength: 6` and the API
 * never overrides it, so a form accepting any other length asks for a code the
 * API can only reject.
 */
export const OTP_LENGTH = 6

export const OTP_ERROR_MESSAGE = `Entrez le code complet à ${OTP_LENGTH} chiffres`

export const otpCodeSchema = z
	.string({ error: OTP_ERROR_MESSAGE })
	.trim()
	.regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), OTP_ERROR_MESSAGE)
