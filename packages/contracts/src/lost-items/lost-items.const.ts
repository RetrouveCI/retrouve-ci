export const LOST_ITEM_TYPES = ['lost', 'found'] as const

export const LOST_ITEM_CATEGORIES = [
	'phone',
	'keys',
	'wallet',
	'bag',
	'electronics',
	'clothing',
	'jewelry',
	'documents',
	'other',
] as const

export const RESOLUTION_STATUSES = ['active', 'resolved', 'expired'] as const

export const MODERATION_STATUSES = ['pending', 'published', 'hidden'] as const

/**
 * Why a listing was hidden, as a code rather than a sentence: the poster then
 * reads the same wording for the same fault, and each app writes its own — a
 * moderator needs a short label, its owner a full explanation. A reason added
 * here is a compilation error on both label tables.
 */
export const MODERATION_REASONS = [
	'document_number_visible',
	'unclear_photo',
	'vague_description',
	'contact_in_description',
	'duplicate',
	'off_topic',
	'other',
] as const

/** Only `other` carries a note, and then it is required. */
export const MAX_MODERATION_NOTE_LENGTH = 300

export const MAX_PHOTOS = 5
export const MIN_DESCRIPTION_LENGTH = 20
export const MAX_DESCRIPTION_LENGTH = 2000

/** A new type must be a compilation error on the fronts' label tables. */
export const DOCUMENT_TYPES = [
	'national_id',
	'driver_licence',
	'bank_card',
	'insurance_card',
	'passport',
	'student_card',
	'other',
] as const

export const MAX_DOCUMENT_NUMBER_LENGTH = 40

/** A bank card is recognised by its last four digits — never by its PAN. */
export const BANK_CARD_DIGITS = 4
