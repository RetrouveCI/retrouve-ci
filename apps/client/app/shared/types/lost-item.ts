import type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
	ModerationStatus,
	ResolutionStatus,
} from '@app/contracts/lost-items'

export type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationReason,
	ModerationStatus,
}

/**
 * The piece a listing declares. There is no `number` here on purpose: the API
 * strips it from every public read, so no screen this type serves can show one.
 */
export interface LostItemDocument {
	type: DocumentType
	holderName?: string
	issuer?: string
}

/** The API calls it a resolution status; this app has always said `status`. */
export type LostItemStatus = ResolutionStatus

export interface LostItem {
	id: string
	title: string
	description: string
	location: string
	ville?: string
	commune?: string
	date: string
	dateISO?: string
	type: LostItemType
	category: LostItemCategory | string
	image?: string
	images?: string[]
	document?: LostItemDocument
}

/** Why a moderator pulled a listing down. Never served on a public read. */
export interface ListingModeration {
	reason: ModerationReason
	note?: string
}

export interface UserLostItem extends LostItem {
	status: LostItemStatus
	moderationStatus: ModerationStatus
	moderation?: ListingModeration
	createdAt: string
	views: number
	contacts: number
}
