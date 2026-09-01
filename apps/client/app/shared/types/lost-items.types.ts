import type {
	LostItem,
	LostItemType,
	LostItemCategory,
	LostItemStatus,
	ModerationStatus,
} from './lost-item'

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
	/** `whatsapp` is the stored `contactWhatsapp`, in whatever shape the row holds. */
	contact: { name: string; whatsapp: string }
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
	moderationStatus: ModerationStatus
	resolutionStatus: LostItemStatus
	views: number
	contactsCount: number
	createdAt: string
}

/**
 * The two state axes counted over every listing the visitor owns, not over the
 * page the browser happens to hold. Unfiltered on purpose: a pill counter says
 * how many there are in that bucket, and a moderation exception must not be
 * hidden by a search.
 */
export interface MyLostItemsSummaryApiResponse {
	total: number
	lifecycle: Record<LostItemStatus, number>
	moderation: Record<ModerationStatus, number>
}

export interface LostItemListApiResponse {
	items: LostItemApiDto[]
	total: number
	page: number
	pageSize: number
}
