import type { QrTokenStatus } from './types/qr-token.types'

export const QR_TOKEN_STATUSES: QrTokenStatus[] = [
	'generated',
	'activated',
	'revoked',
]

export const QR_CODE_PREFIX = 'RCI'
export const QR_CODE_RANDOM_LENGTH = 6

export const MIN_GENERATE_COUNT = 1
export const MAX_GENERATE_COUNT = 500

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
