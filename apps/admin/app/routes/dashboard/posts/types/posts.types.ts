import type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
} from '@app/contracts/lost-items'
import type { Paginated } from '@app/contracts/shared'

export type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
}

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

export type PostListResponse = Paginated<Post>
