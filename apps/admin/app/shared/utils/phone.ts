const COUNTRY_CODE = '225'
const LOCAL_NUMBER_LENGTH = 10

export const PHONE_ERROR_MESSAGE = 'Entrez un numéro à 10 chiffres'

/**
 * An administrator's phone is not an OTP recipient — the backoffice signs in by
 * email — but it lands in the same `user.phoneNumber` column the public app
 * sends codes to, so it obeys the same rule.
 *
 * Duplicated from `apps/client`'s copy on purpose: there is no shared contracts
 * package yet (E5/E6 of MIGRATION-PLAN.md), and two apps cannot import each
 * other.
 */
export function isValidLocalNumber(input: string): boolean {
	const digits = input.replace(/\D/g, '')
	const local = digits.startsWith(COUNTRY_CODE)
		? digits.slice(COUNTRY_CODE.length)
		: digits

	return local.length === LOCAL_NUMBER_LENGTH
}
