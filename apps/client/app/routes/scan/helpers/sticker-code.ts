import { QR_CODE_PREFIX, QR_CODE_RANDOM_LENGTH } from '@app/contracts/qr-codes'

export type StickerCodeResult =
	{ ok: true; code: string } | { ok: false; reason: 'foreign' }

const NOT_CODE_CHARACTER = /[^A-Z0-9]/g
const MAX_CODE_LENGTH = QR_CODE_PREFIX.length + QR_CODE_RANDOM_LENGTH

/**
 * A sticker's QR encodes the full `https://…/q/RCI-XXXXXX`, but the code is also
 * printed underneath it, so the same string arrives either whole or bare. One
 * parser reads both — the camera and the manual field must never disagree on
 * what a valid code is.
 */
export function parseStickerCode(raw: string): StickerCodeResult {
	const candidate = takeCodeSegment(raw)
		.toUpperCase()
		.replace(NOT_CODE_CHARACTER, '')

	if (!candidate.startsWith(QR_CODE_PREFIX))
		return { ok: false, reason: 'foreign' }

	const suffix = candidate.slice(QR_CODE_PREFIX.length)
	if (suffix.length !== QR_CODE_RANDOM_LENGTH) {
		return { ok: false, reason: 'foreign' }
	}

	return { ok: true, code: `${QR_CODE_PREFIX}-${suffix}` }
}

/**
 * The host is deliberately not checked: the printed origin differs between
 * production, staging and a phone pointed at a laptop, and refusing on it would
 * break the scanner everywhere but production.
 */
function takeCodeSegment(raw: string): string {
	const trimmed = raw.trim()
	const marker = trimmed.lastIndexOf('/q/')

	if (marker === -1) return trimmed

	return trimmed.slice(marker + '/q/'.length).split(/[?#]/)[0] ?? ''
}

/**
 * What the field shows as it is typed. The printed code carries one dash and six
 * characters after `RCI` — the artboard's `RCI—4A7F—••••` describes a code the
 * generator has never minted — so the whole of the formatting is that one dash.
 */
export function formatStickerCode(raw: string): string {
	// A pasted URL is left alone: `parseStickerCode` reads it whole on submit,
	// where the mask below would keep the host and throw the code away.
	if (raw.includes('/')) return raw.trim()

	const cleaned = raw
		.toUpperCase()
		.replace(NOT_CODE_CHARACTER, '')
		.slice(0, MAX_CODE_LENGTH)

	if (!cleaned.startsWith(QR_CODE_PREFIX)) return cleaned

	const suffix = cleaned.slice(QR_CODE_PREFIX.length)
	return suffix ? `${QR_CODE_PREFIX}-${suffix}` : cleaned
}
