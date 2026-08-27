/** Two minutes, as agreed. better-auth's own default is 300 seconds. */
export const OTP_TTL_SECONDS = 500

/**
 * One SMS segment. Past it Letexto bills — and may split — the message, so the
 * templates below are asserted against it in `otp-message.spec.ts` rather than
 * checked at runtime: the length is fully determined by the template plus a
 * six-digit code, and throwing here would turn a copywriting slip into a failed
 * sign-in.
 */
export const MAX_OTP_SMS_LENGTH = 150

export const OTP_ATTEMPTS = 3
export const OTP_BACKOFF_DELAY_MS = 5_000
