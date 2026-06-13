import { randomInt } from 'node:crypto'
import { QR_CODE_PREFIX, QR_CODE_RANDOM_LENGTH } from '../constants'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateQrCode(): string {
	let suffix = ''

	for (let i = 0; i < QR_CODE_RANDOM_LENGTH; i++) {
		suffix += ALPHABET[randomInt(ALPHABET.length)]
	}

	return `${QR_CODE_PREFIX}-${suffix}`
}
