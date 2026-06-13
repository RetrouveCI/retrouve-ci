import type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
} from '../types/lost-item.types'

export interface LostItem {
	id: string
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune: string | null
	eventDate: Date
	contactName: string
	contactWhatsapp: string
	photos: string[]
	moderationStatus: ModerationStatus
	resolutionStatus: ResolutionStatus
	views: number
	contactsCount: number
	userId: string
	createdAt: Date
	updatedAt: Date
}

export interface LostItemListResponse {
	items: LostItem[]
	total: number
	page: number
	pageSize: number
}
