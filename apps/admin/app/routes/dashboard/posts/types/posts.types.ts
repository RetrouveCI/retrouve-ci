import type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
	ModerationStatus,
	ResolutionStatus,
} from '@app/contracts/lost-items'
import type { Paginated } from '@app/contracts/shared'

export type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
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
	documentType: DocumentType | null
	documentHolderName: string | null
	// The number reaches the backoffice and nowhere else: it is what moderation
	// reads, and it is stripped from every public read.
	documentNumber: string | null
	documentIssuer: string | null
	moderationStatus: ModerationStatus
	/** Only ever served on an admin read; the API strips it from public ones. */
	moderationReason: ModerationReason | null
	moderationReasonNote: string | null
	resolutionStatus: ResolutionStatus
	views: number
	contactsCount: number
	userId: string
	createdAt: string
	updatedAt: string
}

export type PostListResponse = Paginated<Post>
