import type {
	DocumentType,
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
} from '@app/contracts/lost-items'

export type { DocumentType, LostItemCategory, LostItemType, ModerationStatus }

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

export interface UserLostItem extends LostItem {
	status: LostItemStatus
	moderationStatus: ModerationStatus
	createdAt: string
	views: number
	contacts: number
}
