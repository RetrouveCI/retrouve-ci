import type { LostItemCategory, LostItemType } from './types/lost-item.types'

export const LOST_ITEM_TYPES: LostItemType[] = ['lost', 'found']

export const LOST_ITEM_CATEGORIES: LostItemCategory[] = [
	'phone',
	'keys',
	'wallet',
	'bag',
	'electronics',
	'clothing',
	'jewelry',
	'documents',
	'other',
]

export const MAX_PHOTOS = 5
export const MIN_DESCRIPTION_LENGTH = 20
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 50
