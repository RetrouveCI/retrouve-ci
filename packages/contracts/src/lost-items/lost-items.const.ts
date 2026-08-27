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
