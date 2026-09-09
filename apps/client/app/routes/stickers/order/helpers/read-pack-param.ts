import { STICKER_PACKS_BY_ID } from '@app/contracts/sticker-orders'

/** A pack id the catalogue carries, or nothing. Never a value from the URL. */
export function readPackParam(value: string | null): string {
	if (!value) return ''

	return Object.hasOwn(STICKER_PACKS_BY_ID, value) ? value : ''
}
