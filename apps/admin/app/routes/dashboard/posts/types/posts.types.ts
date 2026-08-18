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

export interface Post {
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
	resolutionStatus: ResolutionStatus
	views: number
	contactsCount: number
	userId: string
	createdAt: string
	updatedAt: string
}

export interface PostListResponse {
	items: Post[]
	total: number
	page: number
	pageSize: number
}
