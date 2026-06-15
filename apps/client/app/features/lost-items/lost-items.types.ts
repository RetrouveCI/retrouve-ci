import type {
	LostItem,
	LostItemType,
	LostItemCategory,
	LostItemStatus,
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

export interface LostItemApiDto {
	id: string
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune: string | null
	eventDate: string
	contactName: string
	contactWhatsapp: string
	photos: string[]
	resolutionStatus: LostItemStatus
	views: number
	contactsCount: number
	createdAt: string
}

export interface LostItemListApiResponse {
	items: LostItemApiDto[]
	total: number
	page: number
	pageSize: number
}
