import type {
	LostItemCategory,
	LostItemType,
	ModerationStatus,
	ResolutionStatus,
} from '@app/contracts/lost-items'

export type { LostItemCategory, LostItemType, ModerationStatus }

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
}

export interface UserLostItem extends LostItem {
	status: LostItemStatus
	moderationStatus: ModerationStatus
	createdAt: string
	views: number
	contacts: number
}
