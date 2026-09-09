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

/**
 * Both fronts bounded these on their own — 80 and 140 characters, against the
 * 60 and 120 the API enforces — so a seventy-character name passed the form and
 * came back « Validation failed » with nothing on the field.
 */
export const QR_LABEL_MAX_LENGTH = 60
export const QR_LINKED_OBJECT_MAX_LENGTH = 120
