export type LostItemType = 'lost' | 'found'

export type LostItemCategory =
	| 'phone'
	| 'keys'
	| 'wallet'
	| 'bag'
	| 'electronics'
	| 'clothing'
	| 'jewelry'
	| 'documents'
	| 'other'

export type ModerationStatus = 'pending' | 'published' | 'hidden'

export type ResolutionStatus = 'active' | 'resolved' | 'expired'

export interface CreateLostItemData {
	type: LostItemType
	category: LostItemCategory
	title: string
	description: string
	ville: string
	commune?: string
	eventDate: Date
	contactName: string
	contactWhatsapp: string
	photos?: string[]
	userId: string
}

export interface UpdateLostItemData {
	title?: string
	description?: string
	ville?: string
	commune?: string
	eventDate?: Date
	contactName?: string
	contactWhatsapp?: string
	photos?: string[]
	resolutionStatus?: ResolutionStatus
}

export interface ListLostItemsFilter {
	type?: LostItemType
	category?: LostItemCategory
	ville?: string
	moderationStatus?: ModerationStatus
	resolutionStatus?: ResolutionStatus
	page: number
	pageSize: number
}
