export const COUNTRY_CODE = '225'
export const LOCAL_NUMBER_LENGTH = 10

export const PHONE_ERROR_MESSAGE = 'Entrez un numéro à 10 chiffres'

export function stripPhoneSpacing(input: string): string {
	return input.replace(/\D/g, '')
}

export function toLocalDigits(input: string): string {
	const digits = stripPhoneSpacing(input)

	return digits.startsWith(COUNTRY_CODE)
		? digits.slice(COUNTRY_CODE.length)
		: digits
}

export function isValidLocalNumber(input: string): boolean {
	return toLocalDigits(input).length === LOCAL_NUMBER_LENGTH
}

export function toE164(localNumber: string): string {
	return `+${COUNTRY_CODE}${toLocalDigits(localNumber)}`
}
