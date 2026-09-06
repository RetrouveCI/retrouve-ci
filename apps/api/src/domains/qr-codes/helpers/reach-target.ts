import {
	COUNTRY_CODE,
	isValidLocalNumber,
	toLocalDigits,
} from '@app/contracts/shared'
import type { ReachChannel } from '../types/qr-token.types'

/**
 * Where a consented jump sends the finder. It reads a stored number, hence the
 * length-only predicate: an account may predate `isAssignableLocalNumber` and
 * still ring. `null` rather than a throw — an owner with no usable number is an
 * ordinary state, not a failure.
 */
export function toReachTarget(
	phoneNumber: string | null,
	channel: ReachChannel,
	message?: string,
): string | null {
	if (!phoneNumber || !isValidLocalNumber(phoneNumber)) return null

	const digits = `${COUNTRY_CODE}${toLocalDigits(phoneNumber)}`

	if (channel === 'call') return `tel:+${digits}`

	// `wa.me` addresses the number without its `+`.
	const text = message ? `?text=${encodeURIComponent(message)}` : ''

	return `https://wa.me/${digits}${text}`
}
