export const COUNTRY_CODE = '225'
export const LOCAL_NUMBER_LENGTH = 10

// The three prefixes Côte d'Ivoire assigns to a mobile line, in local form.
const ASSIGNABLE_LOCAL_NUMBER_PATTERN = /^0[157]\d{8}$/

export const PHONE_ERROR_MESSAGE = 'Entrez un numéro à 10 chiffres'
export const ASSIGNABLE_PHONE_ERROR_MESSAGE =
	'Entrez un numéro ivoirien : 01, 05 ou 07 suivi de 8 chiffres'

export function stripPhoneSpacing(input: string): string {
	return input.replace(/\D/g, '')
}

export function toLocalDigits(input: string): string {
	const digits = stripPhoneSpacing(input)

	return digits.startsWith(COUNTRY_CODE)
		? digits.slice(COUNTRY_CODE.length)
		: digits
}

/**
 * Length only, deliberately. This is the predicate the two paths that read an
 * **existing** account use — sign-in and password recovery — plus better-auth's
 * `phoneNumberValidator`, which guards those same two routes and no other.
 * Tightening it would lock out every account whose stored number predates
 * `isAssignableLocalNumber`.
 */
export function isValidLocalNumber(input: string): boolean {
	return toLocalDigits(input).length === LOCAL_NUMBER_LENGTH
}

/**
 * The rule for a number typed for the first time: it must be one an operator
 * could actually deliver an SMS to. A foreign or made-up number used to be
 * stored as `+225` + itself, so no code ever arrived and the sender was left on
 * the OTP screen with nothing to read.
 */
export function isAssignableLocalNumber(input: string): boolean {
	return ASSIGNABLE_LOCAL_NUMBER_PATTERN.test(toLocalDigits(input))
}

export function toE164(localNumber: string): string {
	return `+${COUNTRY_CODE}${toLocalDigits(localNumber)}`
}
