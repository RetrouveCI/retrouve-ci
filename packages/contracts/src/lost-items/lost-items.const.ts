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
