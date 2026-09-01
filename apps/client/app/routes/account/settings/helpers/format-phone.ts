import {
	COUNTRY_CODE,
	isValidLocalNumber,
	toLocalDigits,
} from '@/shared/utils/phone'

/**
 * How a stored number reads back to its owner: `+225 07 00 00 00 00`, the shape
 * the artboard shows and the one people dictate. A number the rule does not
 * recognise — an account predating it — is shown exactly as it was stored.
 */
export function formatPhoneForDisplay(phone: string | null): string | null {
	if (!phone) return null

	const local = toLocalDigits(phone)
	if (!isValidLocalNumber(local)) return phone

	const pairs = local.match(/\d{2}/g) ?? []

	return `+${COUNTRY_CODE} ${pairs.join(' ')}`
}
