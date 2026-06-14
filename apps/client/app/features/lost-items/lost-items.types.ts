import type {
	LostItem,
	LostItemType,
	LostItemCategory,
} from '@/shared/types/lost-item'

export interface LostItemFilters {
	type?: LostItemType | 'all'
	category?: LostItemCategory | string | 'all'
	ville?: string
	commune?: string
	search?: string
	dateFrom?: Date
	dateTo?: Date
}

export interface LostItemDetail extends LostItem {
	contact: { name: string; method: string }
}
