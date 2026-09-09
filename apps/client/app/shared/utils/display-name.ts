import { isValidLocalNumber } from '@/shared/utils/phone'

const PHONE_SHAPED = /^[+\d\s().-]+$/

/**
 * A sign-up by phone has no name to store, so the API stamps the number itself
 * (`getTempName`): the account then greets its owner with their own number.
 */
export function isPhoneLikeName(name: string): boolean {
	const trimmed = name.trim()

	return PHONE_SHAPED.test(trimmed) && isValidLocalNumber(trimmed)
}

/** The account name, or nothing when it is only the number we stored for it. */
export function toContactName(name: string): string {
	return isPhoneLikeName(name) ? '' : name.trim()
}
