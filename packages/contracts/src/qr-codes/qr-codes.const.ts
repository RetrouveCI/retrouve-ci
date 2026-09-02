export const QR_TOKEN_STATUSES = ['generated', 'activated', 'revoked'] as const

export const MIN_GENERATE_COUNT = 1
export const MAX_GENERATE_COUNT = 500

/**
 * The sticker code as the API mints it: `RCI-` then six characters drawn from
 * an alphabet with no I, O, 0 or 1, so a code read aloud or copied off a sticker
 * cannot be ambiguous. Both halves live here because two sides now depend on
 * them — `generateQrCode` writes the code, and the client's scanner parses it.
 */
export const QR_CODE_PREFIX = 'RCI'
export const QR_CODE_RANDOM_LENGTH = 6
